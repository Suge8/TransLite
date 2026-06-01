import type { ScriptPublicPath } from "wxt/utils/inject-script"
import type { Config } from "@/types/config/config"
import type { LangCodeISO6393 } from "@/utils/languages/definitions"
import { browser, storage } from "#imports"
import { normalizeDetectedCode } from "@/utils/config/languages"
import { CONFIG_STORAGE_KEY, DEFAULT_DETECTED_CODE } from "@/utils/constants/config"
import { getDetectedCodeStateKey, getTranslationStateKey } from "@/utils/constants/storage-keys"
import { shouldEnableAutoTranslation } from "@/utils/host/translate/auto-translation"
import { logger } from "@/utils/logger"
import { onMessage, sendMessage } from "@/utils/message"
import { injectHostContentIntoTabIframes } from "./iframe-injection"
import {
  getPageTranslationEnabled,
  getPageTranslationState,
  isPageTranslationStateInUrlScope,
  setPageTranslationEnabled,
} from "./page-translation-state"

const HOST_LANGUAGE_DETECTOR_SCRIPT_FILE = "/host-language-detector.js" satisfies ScriptPublicPath
const HOST_RUNTIME_SCRIPT_FILE = "/host-runtime.js" satisfies ScriptPublicPath

function notifyPageTranslationStateChanged(tabId: number, enabled: boolean) {
  void sendMessage("notifyTranslationStateChanged", { enabled }, tabId)
    .catch(error => logger.warn("Failed to notify page translation state change", error))
}

function requestManagerToTogglePageTranslation(tabId: number, enabled: boolean) {
  void sendMessage("askManagerToTogglePageTranslation", { enabled }, tabId)
    .catch(error => logger.warn("Failed to ask page translation manager to toggle", error))
}

function isIframe(frameId: number | undefined): boolean {
  return frameId !== undefined && frameId !== 0
}

async function getDetectedCodeForTab(tabId: number): Promise<LangCodeISO6393> {
  const storedCode = await storage.getItem<unknown>(getDetectedCodeStateKey(tabId))
  return normalizeDetectedCode(storedCode)
}

function notifyDetectedCodeChanged(detectedCode: LangCodeISO6393) {
  void sendMessage("detectedPageLanguageChanged", { detectedCode }).catch(() => {})
}

async function isActiveCurrentWindowTab(tabId: number): Promise<boolean> {
  const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
  return activeTab?.id === tabId
}

async function injectHostScript(file: ScriptPublicPath, tabId: number, frameId: number | undefined): Promise<void> {
  const target = frameId === undefined
    ? { tabId }
    : { tabId, frameIds: [frameId] }

  await browser.scripting.executeScript({
    target,
    files: [file],
    world: "ISOLATED",
  })
}

function requestDetectedPageLanguageRefresh(tabId: number) {
  void sendMessage("refreshDetectedPageLanguage", undefined, tabId)
    .catch(error => logger.warn("Failed to refresh detected page language", error))
}

async function publishAndRefreshActiveTab(tabId: number): Promise<void> {
  notifyDetectedCodeChanged(await getDetectedCodeForTab(tabId))
  requestDetectedPageLanguageRefresh(tabId)
}

export function translationMessage() {
  onMessage("getEnablePageTranslationByTabId", async (msg) => {
    return await getPageTranslationEnabled(msg.data.tabId)
  })

  onMessage("getEnablePageTranslationFromContentScript", async (msg) => {
    const tabId = msg.sender?.tab?.id
    if (typeof tabId === "number") {
      return await getPageTranslationEnabled(tabId)
    }
    logger.error("Invalid tabId in getEnablePageTranslationFromContentScript", msg)
    return false
  })

  onMessage("ensureHostRuntimeInjected", async (msg) => {
    const tabId = msg.sender?.tab?.id
    if (typeof tabId !== "number") {
      logger.error("Invalid tabId in ensureHostRuntimeInjected", msg)
      return
    }

    await injectHostScript(HOST_RUNTIME_SCRIPT_FILE, tabId, msg.sender?.frameId)
    void sendMessage("setHostRuntimePageTranslation", { enabled: msg.data.enabled }, tabId)
      .catch(error => logger.warn("Failed to set host runtime translation state", error))
  })

  onMessage("setHostRuntimePageTranslation", async (msg) => {
    const tabId = msg.sender?.tab?.id
    if (typeof tabId !== "number") {
      logger.error("Invalid tabId in setHostRuntimePageTranslation", msg)
      return
    }

    void sendMessage("setHostRuntimePageTranslation", msg.data, tabId)
      .catch(error => logger.warn("Failed to forward host runtime translation state", error))
  })

  onMessage("detectHostPageLanguage", async (msg) => {
    const tabId = msg.sender?.tab?.id
    if (typeof tabId !== "number") {
      logger.error("Invalid tabId in detectHostPageLanguage", msg)
      return
    }

    await injectHostScript(HOST_LANGUAGE_DETECTOR_SCRIPT_FILE, tabId, msg.sender?.frameId)
  })

  onMessage("ensureIframeHostContentInjected", async (msg) => {
    const tabId = msg.data?.tabId ?? msg.sender?.tab?.id
    if (typeof tabId === "number") {
      await injectHostContentIntoTabIframes(tabId)
      return
    }

    logger.error("Invalid tabId in ensureIframeHostContentInjected", msg)
  })

  onMessage("reportDetectedPageLanguage", async (msg) => {
    const tabId = msg.sender?.tab?.id
    const { url, detectedCodeOrUnd } = msg.data
    if (typeof tabId !== "number") {
      logger.error("Invalid tabId in reportDetectedPageLanguage", msg)
      return
    }

    const detectedCode = normalizeDetectedCode(detectedCodeOrUnd)
    await storage.setItem<LangCodeISO6393>(getDetectedCodeStateKey(tabId), detectedCode)

    if (await isActiveCurrentWindowTab(tabId)) {
      notifyDetectedCodeChanged(detectedCode)
    }

    const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
    if (config && await shouldEnableAutoTranslation(url, detectedCodeOrUnd, config)) {
      await setPageTranslationEnabled(tabId, true, url, "auto")
      requestManagerToTogglePageTranslation(tabId, true)
    }
  })

  onMessage("getDetectedCode", async (msg) => {
    const tabId = msg.sender?.tab?.id
    if (typeof tabId === "number") {
      return await getDetectedCodeForTab(tabId)
    }

    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
    return typeof activeTab?.id === "number"
      ? await getDetectedCodeForTab(activeTab.id)
      : DEFAULT_DETECTED_CODE
  })

  onMessage("tryToSetEnablePageTranslationByTabId", async (msg) => {
    const { tabId, enabled } = msg.data
    await setPageTranslationEnabled(tabId, enabled, msg.sender?.tab?.url, "manual")
    if (!enabled) {
      notifyPageTranslationStateChanged(tabId, false)
    }
    requestManagerToTogglePageTranslation(tabId, enabled)
  })

  onMessage("tryToSetEnablePageTranslationOnContentScript", async (msg) => {
    const tabId = msg.sender?.tab?.id
    const { enabled } = msg.data
    if (typeof tabId !== "number") {
      logger.error("tabId is not a number", msg)
      return
    }

    logger.info("sending tryToSetEnablePageTranslationOnContentScript to manager", { enabled, tabId })
    await setPageTranslationEnabled(tabId, enabled, msg.sender?.tab?.url, "manual")
    if (!enabled) {
      notifyPageTranslationStateChanged(tabId, false)
    }
    requestManagerToTogglePageTranslation(tabId, enabled)
  })

  onMessage("setAndNotifyPageTranslationStateChangedByManager", async (msg) => {
    const tabId = msg.sender?.tab?.id
    const { enabled, url } = msg.data
    if (typeof tabId !== "number") {
      logger.error("tabId is not a number", msg)
      return
    }

    const senderFrameId = msg.sender?.frameId
    if (enabled && isIframe(senderFrameId)) {
      const currentState = await getPageTranslationState(tabId)
      if (currentState?.enabled) {
        notifyPageTranslationStateChanged(tabId, true)
      }
      return
    }

    const previousState = await getPageTranslationState(tabId)
    await setPageTranslationEnabled(tabId, enabled, url ?? msg.sender?.tab?.url, previousState?.source ?? "manual")
    notifyPageTranslationStateChanged(tabId, enabled)

    if (enabled && !isIframe(senderFrameId)) {
      void injectHostContentIntoTabIframes(tabId)
    }
  })

  browser.tabs.onRemoved.addListener(async (tabId) => {
    await storage.removeItem(getTranslationStateKey(tabId))
    await storage.removeItem(getDetectedCodeStateKey(tabId))
  })

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    await publishAndRefreshActiveTab(activeInfo.tabId)
  })

  browser.webNavigation.onCommitted.addListener(async (details) => {
    if (details.frameId !== 0)
      return

    const state = await getPageTranslationState(details.tabId)
    if (!state?.enabled)
      return

    const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
    const isAutoState = state.source !== "manual"
    const shouldKeepAutoState = isAutoState
      && config
      && await shouldEnableAutoTranslation(details.url, "und", config)

    if ((isAutoState && !shouldKeepAutoState) || !isPageTranslationStateInUrlScope(state, details.url)) {
      await storage.removeItem(getTranslationStateKey(details.tabId))
    }
  })
}
