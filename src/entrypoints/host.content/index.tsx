import type { Config } from "@/types/config/config"
import { browser, defineContentScript } from "#imports"
import { CONFIG_STORAGE_KEY } from "@/utils/constants/storage-keys"
import { onMessage, sendMessage } from "@/utils/message"
import { clearEffectiveSiteControlUrl, getEffectiveSiteControlUrl, isSiteEnabled } from "@/utils/site-control"
import { matchDomainPattern } from "@/utils/url"
import { bindTranslationShortcutKey } from "./translation-control/bind-translation-shortcut"

declare global {
  interface Window {
    __TRANSLITE_HOST_INJECTED__?: boolean
  }
}

type Cleanup = () => void

async function getInitialConfig(): Promise<Config | null> {
  const storedValues = await browser.storage.local.get(CONFIG_STORAGE_KEY)
  return (storedValues[CONFIG_STORAGE_KEY] as Config | undefined) ?? null
}

function hasAutoTranslationRules(config: Config | null): boolean {
  const pageConfig = config?.translate.page
  return window === window.top
    && ((pageConfig?.autoTranslatePatterns.length ?? 0) > 0
      || (pageConfig?.autoTranslateLanguages.length ?? 0) > 0)
}

function matchesAutoTranslateSite(url: string, config: Config | null): boolean {
  return config?.translate.page.autoTranslatePatterns.some(pattern => matchDomainPattern(url, pattern)) ?? false
}

async function reportAutoTranslationCandidate(config: Config | null): Promise<void> {
  if (matchesAutoTranslateSite(window.location.href, config)) {
    await sendMessage("reportDetectedPageLanguage", {
      url: window.location.href,
      detectedCodeOrUnd: "und",
    })
    return
  }

  if ((config?.translate.page.autoTranslateLanguages.length ?? 0) > 0) {
    await sendMessage("detectHostPageLanguage", undefined)
  }
}

async function setupAutoTranslationDetection(config: Config | null): Promise<Cleanup> {
  if (!hasAutoTranslationRules(config))
    return () => {}

  const handleUrlChange = () => {
    void reportAutoTranslationCandidate(config).catch(() => {})
  }
  window.addEventListener("extension:URLChange", handleUrlChange)

  const { setupUrlChangeListener } = await import("./listen")
  const cleanupUrlListener = setupUrlChangeListener()

  void reportAutoTranslationCandidate(config).catch(() => {})

  return () => {
    cleanupUrlListener()
    window.removeEventListener("extension:URLChange", handleUrlChange)
  }
}

export default defineContentScript({
  matches: ["*://*/*", "file:///*"],
  cssInjectionMode: "manual",
  async main(ctx) {
    if (window.__TRANSLITE_HOST_INJECTED__)
      return
    window.__TRANSLITE_HOST_INJECTED__ = true

    const initialConfig = await getInitialConfig()
    const siteControlUrl = getEffectiveSiteControlUrl(window.location.href)

    if (!isSiteEnabled(siteControlUrl, initialConfig)) {
      window.__TRANSLITE_HOST_INJECTED__ = false
      clearEffectiveSiteControlUrl()
      return
    }

    let runtimeRequested = false
    let desiredRuntimeEnabled = false
    let pageTranslationEnabled = false
    let cleanupAutoTranslationDetection: Cleanup = () => {}

    const requestRuntimeTranslation = async (enabled: boolean) => {
      pageTranslationEnabled = enabled
      desiredRuntimeEnabled = enabled

      if (!runtimeRequested) {
        if (!enabled)
          return

        runtimeRequested = true
        await sendMessage("ensureHostRuntimeInjected", { enabled })
        if (desiredRuntimeEnabled !== enabled) {
          await sendMessage("setHostRuntimePageTranslation", { enabled: desiredRuntimeEnabled })
        }
        return
      }

      await sendMessage("setHostRuntimePageTranslation", { enabled })
    }

    const cleanupPageTranslationShortcut = bindTranslationShortcutKey(initialConfig, () => {
      void requestRuntimeTranslation(!pageTranslationEnabled)
    })

    const cleanupAskTranslation = onMessage("askManagerToTogglePageTranslation", (message) => {
      void requestRuntimeTranslation(message.data.enabled)
    })

    const cleanupTranslationState = onMessage("notifyTranslationStateChanged", (message) => {
      pageTranslationEnabled = message.data.enabled
      void requestRuntimeTranslation(message.data.enabled)
    })

    const cleanupDetectedLanguageRefresh = hasAutoTranslationRules(initialConfig)
      ? onMessage("refreshDetectedPageLanguage", () => {
          void reportAutoTranslationCandidate(initialConfig).catch(() => {})
        })
      : () => {}

    cleanupAutoTranslationDetection = await setupAutoTranslationDetection(initialConfig)

    void sendMessage("getEnablePageTranslationFromContentScript", undefined)
      .then(async (enabled) => {
        pageTranslationEnabled = await enabled
        if (pageTranslationEnabled)
          void requestRuntimeTranslation(true)
      })
      .catch(() => {})

    ctx.onInvalidated(() => {
      cleanupPageTranslationShortcut()
      cleanupAskTranslation()
      cleanupTranslationState()
      cleanupDetectedLanguageRefresh()
      cleanupAutoTranslationDetection()
      window.__TRANSLITE_HOST_INJECTED__ = false
      clearEffectiveSiteControlUrl()
    })
  },
})
