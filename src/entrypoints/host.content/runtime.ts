import type { Config } from "@/types/config/config"
import { DEFAULT_CONFIG } from "@/utils/constants/config"
import { ensurePresetStyles } from "@/utils/host/translate/ui/style-injector"
import { logger } from "@/utils/logger"
import { sendMessage } from "@/utils/message"
import { clearEffectiveSiteControlUrl } from "@/utils/site-control"
import { areSamePageTranslationOrigin } from "@/utils/url"
import { setupUrlChangeListener } from "./listen"
import { mountHostToast } from "./mount-host-toast"
import { PageTranslationManager } from "./translation-control/page-translation"

declare global {
  interface Window {
    __TRANSLITE_HOST_RUNTIME_INJECTED__?: boolean
  }
}

export interface HostRuntimeController {
  setPageTranslationEnabled: (enabled: boolean) => Promise<void>
  destroy: () => void
}

export async function bootstrapHostRuntime(initialConfig: Config | null): Promise<HostRuntimeController> {
  ensurePresetStyles(document)

  const cleanupUrlListener = setupUrlChangeListener()
  const removeHostToast = window === window.top ? mountHostToast() : () => {}

  const preloadConfig = initialConfig?.translate.page.preload ?? DEFAULT_CONFIG.translate.page.preload
  const manager = new PageTranslationManager({
    root: null,
    rootMargin: `${preloadConfig.margin}px`,
    threshold: preloadConfig.threshold,
  })

  const cleanupPageTranslationTriggers = manager.registerPageTranslationTriggers()

  const setPageTranslationEnabled = async (enabled: boolean) => {
    if (enabled === manager.isActive)
      return

    if (enabled) {
      await manager.start()
    }
    else {
      manager.stop()
    }
  }

  const handleUrlChange = async (from: string, to: string) => {
    if (from === to || !manager.isActive)
      return

    logger.info("URL changed from", from, "to", to)
    if (areSamePageTranslationOrigin(from, to)) {
      await manager.restart()
    }
    else {
      manager.stop()
    }
  }

  const handleExtensionUrlChange = (event: Event) => {
    const { from, to } = (event as CustomEvent<{ from: string, to: string }>).detail
    void handleUrlChange(from, to)
  }
  window.addEventListener("extension:URLChange", handleExtensionUrlChange)

  try {
    await setPageTranslationEnabled(await sendMessage("getEnablePageTranslationFromContentScript", undefined))
  }
  catch (error) {
    logger.error("Failed to check translation state:", error)
  }

  return {
    setPageTranslationEnabled,
    destroy() {
      removeHostToast()
      cleanupUrlListener()
      cleanupPageTranslationTriggers()
      window.removeEventListener("extension:URLChange", handleExtensionUrlChange)
      window.__TRANSLITE_HOST_RUNTIME_INJECTED__ = false
      clearEffectiveSiteControlUrl()
    },
  }
}
