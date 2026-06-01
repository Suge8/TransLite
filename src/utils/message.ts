import type {
  BackgroundGenerateTextPayload,
  BackgroundGenerateTextResponse,
} from "@/types/background-generate-text"
import type { Config } from "@/types/config/config"
import type { ProviderConfig } from "@/types/config/provider"
import type { BatchQueueConfig, RequestQueueConfig } from "@/types/config/translate"
import type { ProxyRequest, ProxyResponse } from "@/types/proxy-fetch"
import type { LangCodeISO6393 } from "@/utils/languages/definitions"
import { defineExtensionMessaging } from "@webext-core/messaging"

interface ProtocolMap {
  getEnablePageTranslationByTabId: (data: { tabId: number }) => boolean | undefined
  getEnablePageTranslationFromContentScript: () => Promise<boolean>
  tryToSetEnablePageTranslationByTabId: (data: { tabId: number, enabled: boolean }) => void
  tryToSetEnablePageTranslationOnContentScript: (data: { enabled: boolean }) => void
  setAndNotifyPageTranslationStateChangedByManager: (data: { enabled: boolean, url?: string }) => void
  notifyTranslationStateChanged: (data: { enabled: boolean }) => void
  ensureHostRuntimeInjected: (data: { enabled: boolean }) => void
  setHostRuntimePageTranslation: (data: { enabled: boolean }) => void
  detectHostPageLanguage: () => void
  ensureIframeHostContentInjected: (data: { tabId?: number }) => void
  reportDetectedPageLanguage: (data: { detectedCodeOrUnd: LangCodeISO6393 | "und", url: string }) => void
  refreshDetectedPageLanguage: () => void
  getDetectedCode: () => LangCodeISO6393
  detectedPageLanguageChanged: (data: { detectedCode: LangCodeISO6393 }) => void
  askManagerToTogglePageTranslation: (data: { enabled: boolean }) => void
  enqueueTranslateRequest: (data: { text: string, langConfig: Config["language"], providerConfig: ProviderConfig, scheduleAt: number, hash: string }) => Promise<string>
  enqueueSubtitlesTranslateRequest: (data: { text: string, langConfig: Config["language"], providerConfig: ProviderConfig, scheduleAt: number, hash: string, videoTitle?: string | null, summary?: string | null }) => Promise<string>
  backgroundGenerateText: (data: BackgroundGenerateTextPayload) => Promise<BackgroundGenerateTextResponse>
  aiSegmentSubtitles: (data: { jsonContent: string, providerId: string }) => Promise<string>
  setTranslateRequestQueueConfig: (data: Partial<RequestQueueConfig>) => void
  setTranslateBatchQueueConfig: (data: Partial<BatchQueueConfig>) => void
  setSubtitlesRequestQueueConfig: (data: Partial<RequestQueueConfig>) => void
  setSubtitlesBatchQueueConfig: (data: Partial<BatchQueueConfig>) => void
  microsoftBatchTranslate: (data: { texts: string[], fromLang: string, toLang: string }) => Promise<string[]>
  backgroundFetch: (data: ProxyRequest) => Promise<ProxyResponse>
  clearAllTranslationRelatedCache: () => Promise<void>
  clearAiSegmentationCache: () => Promise<void>
}

export const { sendMessage, onMessage }
  = defineExtensionMessaging<ProtocolMap>()
