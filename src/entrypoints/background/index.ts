import "@/utils/zod-config"
import { browser, defineBackground } from "#imports"
import { logger } from "@/utils/logger"
import { onMessage } from "@/utils/message"
import { runAiSegmentSubtitles } from "./ai-segmentation"
import { ensureInitializedConfig } from "./config"
import { cleanupAllAiSegmentationCache, cleanupAllTranslationCache, setUpDatabaseCleanup } from "./db-cleanup"
import { setupIframeInjection } from "./iframe-injection"
import { setupLLMGenerateTextMessageHandlers } from "./llm-generate-text"
import { proxyFetch } from "./proxy-fetch"
import { setUpSubtitlesTranslationQueue, setUpWebPageTranslationQueue } from "./translation-queues"
import { translationMessage } from "./translation-signal"

export default defineBackground({
  type: "module",
  main: () => {
    logger.info("Hello background!", { id: browser.runtime.id })

    browser.runtime.onInstalled.addListener(async () => {
      await ensureInitializedConfig()
    })

    onMessage("aiSegmentSubtitles", async (message) => {
      try {
        return await runAiSegmentSubtitles(message.data)
      }
      catch (error) {
        logger.error("[Background] aiSegmentSubtitles failed", error)
        throw error
      }
    })

    onMessage("clearAllTranslationRelatedCache", async () => {
      await cleanupAllTranslationCache()
    })

    onMessage("clearAiSegmentationCache", async () => {
      await cleanupAllAiSegmentationCache()
    })

    translationMessage()
    void setUpWebPageTranslationQueue()
    void setUpSubtitlesTranslationQueue()
    void setUpDatabaseCleanup()
    proxyFetch()
    setupLLMGenerateTextMessageHandlers()
    setupIframeInjection()
  },
})
