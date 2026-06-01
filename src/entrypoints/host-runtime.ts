import "@/utils/zod-config"
import type { Config } from "@/types/config/config"
import { defineUnlistedScript } from "wxt/utils/define-unlisted-script"
import { storage } from "#imports"
import { CONFIG_STORAGE_KEY } from "@/utils/constants/storage-keys"
import { onMessage } from "@/utils/message"
import { clearEffectiveSiteControlUrl, getEffectiveSiteControlUrl, isSiteEnabled } from "@/utils/site-control"
import { bootstrapHostRuntime } from "./host.content/runtime"

async function getInitialConfig(): Promise<Config | null> {
  return await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
}

export default defineUnlistedScript(async () => {
  if (window.__TRANSLITE_HOST_RUNTIME_INJECTED__)
    return
  window.__TRANSLITE_HOST_RUNTIME_INJECTED__ = true

  const initialConfig = await getInitialConfig()
  const siteControlUrl = getEffectiveSiteControlUrl(window.location.href)

  if (!isSiteEnabled(siteControlUrl, initialConfig)) {
    window.__TRANSLITE_HOST_RUNTIME_INJECTED__ = false
    clearEffectiveSiteControlUrl()
    return
  }

  const runtime = await bootstrapHostRuntime(initialConfig)
  const setPageTranslationEnabled = (enabled: boolean) => {
    void runtime.setPageTranslationEnabled(enabled)
  }

  const cleanupSetTranslation = onMessage("setHostRuntimePageTranslation", (message) => {
    setPageTranslationEnabled(message.data.enabled)
  })
  const cleanupAskTranslation = onMessage("askManagerToTogglePageTranslation", (message) => {
    setPageTranslationEnabled(message.data.enabled)
  })
  const cleanupTranslationState = onMessage("notifyTranslationStateChanged", (message) => {
    setPageTranslationEnabled(message.data.enabled)
  })

  const cleanup = () => {
    cleanupSetTranslation()
    cleanupAskTranslation()
    cleanupTranslationState()
    runtime.destroy()
    window.removeEventListener("pagehide", cleanup)
  }

  window.addEventListener("pagehide", cleanup)
})
