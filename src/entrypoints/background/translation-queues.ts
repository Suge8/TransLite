import type { Config } from "@/types/config/config"
import type { ProviderConfig } from "@/types/config/provider"
import type { BatchQueueConfig, RequestQueueConfig } from "@/types/config/translate"
import type { SubtitlePromptContext } from "@/types/content"
import type { PromptResolver } from "@/utils/host/translate/api/ai"
import { isLLMProviderConfig } from "@/types/config/provider"
import { DEFAULT_CONFIG } from "@/utils/constants/config"
import { BATCH_SEPARATOR, BATCH_SEPARATOR_LINE_PATTERN } from "@/utils/constants/prompt"
import { db } from "@/utils/db/dexie/db"
import { Sha256Hex } from "@/utils/hash"
import { microsoftTranslate } from "@/utils/host/translate/api/microsoft"
import { executeTranslate } from "@/utils/host/translate/execute-translate"
import { normalizePromptContextValue } from "@/utils/host/translate/translate-text"
import { normalizeTranslationOutput } from "@/utils/host/translate/translation-output-normalization"
import { logger } from "@/utils/logger"
import { onMessage } from "@/utils/message"
import { getSubtitlesTranslatePrompt } from "@/utils/prompts/subtitles"
import { getTranslatePrompt } from "@/utils/prompts/translate"
import { BatchQueue } from "@/utils/request/batch-queue"
import { RequestQueue } from "@/utils/request/request-queue"
import { ensureInitializedConfig } from "./config"

export function parseBatchResult(result: string): string[] {
  return result.trim().split(BATCH_SEPARATOR_LINE_PATTERN).map(t => t.trim())
}

export function shouldUseBatchQueue(providerConfig: ProviderConfig): boolean {
  return isLLMProviderConfig(providerConfig)
}

export async function executeBatchTranslation<TContext>(
  dataList: TranslateBatchData<TContext>[],
  promptResolver: PromptResolver<TContext>,
): Promise<string[]> {
  const { langConfig, providerConfig, context } = dataList[0]
  const texts = dataList.map(d => d.text)

  const batchText = texts.join(`\n\n${BATCH_SEPARATOR}\n\n`)
  const result = await executeTranslate(batchText, langConfig, providerConfig, promptResolver, { isBatch: true, context })
  return parseBatchResult(result)
}

export interface TranslateBatchData<TContext = unknown> {
  text: string
  langConfig: Config["language"]
  providerConfig: ProviderConfig
  hash: string
  scheduleAt: number
  context?: TContext
}

interface TranslationQueueSetupConfig<TContext = unknown> {
  requestQueueConfig: RequestQueueConfig
  batchQueueConfig: BatchQueueConfig
  promptResolver: PromptResolver<TContext>
}

async function createTranslationQueues<TContext>(config: TranslationQueueSetupConfig<TContext>) {
  const { rate, capacity } = config.requestQueueConfig
  const { maxCharactersPerBatch, maxItemsPerBatch } = config.batchQueueConfig
  const { promptResolver } = config

  const requestQueue = new RequestQueue({
    rate,
    capacity,
    timeoutMs: 20_000,
    maxRetries: 2,
    baseRetryDelayMs: 1_000,
  })

  const batchQueue = new BatchQueue<TranslateBatchData<TContext>, string>({
    maxCharactersPerBatch,
    maxItemsPerBatch,
    batchDelay: 100,
    maxRetries: 3,
    enableFallbackToIndividual: true,
    getBatchKey: (data) => {
      return Sha256Hex(`${data.langConfig.sourceCode}-${data.langConfig.targetCode}-${data.providerConfig.id}`)
    },
    getCharacters: data => data.text.length,
    executeBatch: async (dataList) => {
      const hash = Sha256Hex(...dataList.map(d => d.hash))
      const earliestScheduleAt = Math.min(...dataList.map(d => d.scheduleAt))

      const batchThunk = async (): Promise<string[]> => {
        return await executeBatchTranslation(dataList, promptResolver)
      }

      return requestQueue.enqueue(batchThunk, earliestScheduleAt, hash)
    },
    executeIndividual: async (data) => {
      const { text, langConfig, providerConfig, hash, scheduleAt, context } = data
      const thunk = async () => {
        return executeTranslate(text, langConfig, providerConfig, promptResolver, { context })
      }
      return requestQueue.enqueue(thunk, scheduleAt, hash)
    },
    onError: (error, context) => {
      const errorType = context.isFallback ? "Individual request" : "Batch request"
      logger.error(
        `${errorType} failed (batchKey: ${context.batchKey}, retry: ${context.retryCount}):`,
        error.message,
      )
    },
  })

  return { requestQueue, batchQueue }
}

export async function setUpWebPageTranslationQueue() {
  const config = await ensureInitializedConfig()

  const { translate: { requestQueueConfig, batchQueueConfig } } = config ?? DEFAULT_CONFIG

  const { requestQueue, batchQueue } = await createTranslationQueues({
    requestQueueConfig,
    batchQueueConfig,
    promptResolver: getTranslatePrompt,
  })

  onMessage("enqueueTranslateRequest", async (message) => {
    const { data: { text, langConfig, providerConfig, scheduleAt, hash } } = message

    if (hash) {
      const cached = await db.translationCache.get(hash)
      if (cached) {
        return normalizeTranslationOutput(providerConfig, cached.translation)
      }
    }

    const result = shouldUseBatchQueue(providerConfig)
      ? await batchQueue.enqueue({ text, langConfig, providerConfig, hash, scheduleAt })
      : await requestQueue.enqueue(
          () => executeTranslate(text, langConfig, providerConfig, getTranslatePrompt),
          scheduleAt,
          hash,
        )

    if (result && hash) {
      const normalized = normalizeTranslationOutput(providerConfig, result)
      await db.translationCache.put({
        key: hash,
        translation: normalized,
        createdAt: new Date(),
      })
      return normalized
    }

    return result
  })

  onMessage("setTranslateRequestQueueConfig", (message) => {
    const { data } = message
    requestQueue.setQueueOptions(data)
  })

  onMessage("setTranslateBatchQueueConfig", (message) => {
    const { data } = message
    batchQueue.setBatchConfig(data)
  })
}

/**
 * Set up subtitles translation queue and message handlers
 */
export async function setUpSubtitlesTranslationQueue() {
  const config = await ensureInitializedConfig()
  const { videoSubtitles: { requestQueueConfig, batchQueueConfig } } = config ?? DEFAULT_CONFIG

  const { requestQueue, batchQueue } = await createTranslationQueues({
    requestQueueConfig,
    batchQueueConfig,
    promptResolver: getSubtitlesTranslatePrompt,
  })

  onMessage("enqueueSubtitlesTranslateRequest", async (message) => {
    const { data: { text, langConfig, providerConfig, scheduleAt, hash, videoTitle, summary } } = message

    if (hash) {
      const cached = await db.translationCache.get(hash)
      if (cached) {
        return normalizeTranslationOutput(providerConfig, cached.translation)
      }
    }

    let result = ""
    const context: SubtitlePromptContext = {
      videoTitle: normalizePromptContextValue(videoTitle),
      videoSummary: normalizePromptContextValue(summary),
    }

    if (shouldUseBatchQueue(providerConfig)) {
      const data = { text, langConfig, providerConfig, hash, scheduleAt, context }
      result = await batchQueue.enqueue(data)
    }
    else {
      const thunk = () => executeTranslate(text, langConfig, providerConfig, getSubtitlesTranslatePrompt)
      result = await requestQueue.enqueue(thunk, scheduleAt, hash)
    }

    if (result && hash) {
      result = normalizeTranslationOutput(providerConfig, result)
      await db.translationCache.put({
        key: hash,
        translation: result,
        createdAt: new Date(),
      })
    }

    return result
  })

  onMessage("microsoftBatchTranslate", async (message) => {
    const { texts, fromLang, toLang } = message.data
    const hash = Sha256Hex("ms-batch", fromLang, toLang, ...texts)
    const thunk = () => microsoftTranslate(texts, fromLang, toLang)
    return requestQueue.enqueue(thunk, Date.now(), hash)
  })

  onMessage("setSubtitlesRequestQueueConfig", (message) => {
    const { data } = message
    requestQueue.setQueueOptions(data)
  })

  onMessage("setSubtitlesBatchQueueConfig", (message) => {
    const { data } = message
    batchQueue.setBatchConfig(data)
  })
}
