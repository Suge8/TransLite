import type { SubtitlesFragment } from "../types"
import type { Config } from "@/types/config/config"
import type { ProviderConfig } from "@/types/config/provider"
import type { SubtitlePromptContext } from "@/types/content"
import { APICallError } from "ai"
import { i18n } from "#imports"
import { isLLMProviderConfig } from "@/types/config/provider"
import { getProviderConfigById } from "@/utils/config/helpers"
import { getLocalConfig } from "@/utils/config/storage"
import { Sha256Hex } from "@/utils/hash"
import { prepareTranslationText } from "@/utils/host/translate/text-preparation"
import { normalizePromptContextValue } from "@/utils/host/translate/translate-text"
import { LANG_CODE_TO_EN_NAME } from "@/utils/languages/definitions"
import { sendMessage } from "@/utils/message"
import { getSubtitlesTranslatePrompt } from "@/utils/prompts/subtitles"

function toFriendlyErrorMessage(error: unknown): string {
  if (error instanceof APICallError) {
    switch (error.statusCode) {
      case 429:
        return i18n.t("subtitles.errors.aiRateLimited")
      case 401:
      case 403:
        return i18n.t("subtitles.errors.aiAuthFailed")
      case 500:
      case 502:
      case 503:
        return i18n.t("subtitles.errors.aiServiceUnavailable")
    }
  }

  const message = error instanceof Error ? error.message : String(error)

  if (message.includes("No Response") || message.includes("Empty response")) {
    return i18n.t("subtitles.errors.aiNoResponse")
  }

  return message
}

export interface SubtitlesVideoContext {
  videoTitle: string
  subtitlesTextContent: string
  summary?: string | null
}

function normalizeSubtitlePromptContext(videoContext: SubtitlesVideoContext): SubtitlePromptContext {
  return {
    videoTitle: normalizePromptContextValue(videoContext.videoTitle),
    videoSummary: normalizePromptContextValue(videoContext.summary),
  }
}

async function buildSubtitleHashComponents(
  text: string,
  providerConfig: ProviderConfig,
  partialLangConfig: { sourceCode: Config["language"]["sourceCode"], targetCode: Config["language"]["targetCode"] },
  subtitlePromptContext: SubtitlePromptContext,
): Promise<string[]> {
  const preparedText = prepareTranslationText(text)
  const hashComponents = [
    preparedText,
    JSON.stringify(providerConfig),
    partialLangConfig.sourceCode,
    partialLangConfig.targetCode,
  ]

  if (!isLLMProviderConfig(providerConfig)) {
    return hashComponents
  }

  const targetLangName = LANG_CODE_TO_EN_NAME[partialLangConfig.targetCode]
  const { systemPrompt, prompt } = await getSubtitlesTranslatePrompt(targetLangName, preparedText, {
    isBatch: true,
    context: subtitlePromptContext,
  })
  hashComponents.push(systemPrompt, prompt)
  if (subtitlePromptContext.videoTitle) {
    hashComponents.push(`videoTitle:${subtitlePromptContext.videoTitle}`)
  }
  if (subtitlePromptContext.videoSummary) {
    hashComponents.push(`videoSummary:${subtitlePromptContext.videoSummary}`)
  }

  return hashComponents
}

async function translateSingleSubtitle(
  text: string,
  langConfig: Config["language"],
  providerConfig: ProviderConfig,
  videoContext: SubtitlesVideoContext,
): Promise<string> {
  const subtitlePromptContext = normalizeSubtitlePromptContext(videoContext)
  const hashComponents = await buildSubtitleHashComponents(
    text,
    providerConfig,
    { sourceCode: langConfig.sourceCode, targetCode: langConfig.targetCode },
    subtitlePromptContext,
  )

  return await sendMessage("enqueueSubtitlesTranslateRequest", {
    text,
    langConfig,
    providerConfig,
    scheduleAt: Date.now(),
    hash: Sha256Hex(...hashComponents),
    videoTitle: subtitlePromptContext.videoTitle,
    summary: subtitlePromptContext.videoSummary,
  })
}

export async function translateSubtitles(
  fragments: SubtitlesFragment[],
  videoContext: SubtitlesVideoContext,
): Promise<SubtitlesFragment[]> {
  const config = await getLocalConfig()
  if (!config) {
    return fragments.map(f => ({ ...f, translation: "" }))
  }

  const providerConfig = getProviderConfigById(config.providersConfig, config.videoSubtitles.providerId)

  if (!providerConfig) {
    return fragments.map(f => ({ ...f, translation: "" }))
  }

  const langConfig = config.language
  const translationPromises = fragments.map(fragment =>
    translateSingleSubtitle(fragment.text, langConfig, providerConfig, videoContext),
  )

  const results = await Promise.allSettled(translationPromises)

  // If all translations failed, throw with friendly error message
  const allRejected = results.every((r): r is PromiseRejectedResult => r.status === "rejected")
  if (allRejected && results.length) {
    throw new Error(toFriendlyErrorMessage(results[0].reason))
  }

  return fragments.map((fragment, index) => {
    const result = results[index]
    return {
      ...fragment,
      translation: result.status === "fulfilled" ? result.value : "",
    }
  })
}
