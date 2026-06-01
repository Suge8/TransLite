import type { Hotkey, HotkeyRegistrationHandle } from "@tanstack/hotkeys"
import type { Config } from "@/types/config/config"
import { HotkeyManager } from "@tanstack/hotkeys"
import { browser } from "#imports"
import { CONFIG_STORAGE_KEY } from "@/utils/constants/storage-keys"
import { isPageTranslationShortcutEmpty, isValidConfiguredPageTranslationShortcut } from "@/utils/page-translation-shortcut"

export function bindTranslationShortcutKey(config: Config | null, onToggle: () => void) {
  let registration = registerShortcut(config?.translate.page.shortcut, onToggle)

  const handleStorageChange = (changes: Record<string, { newValue?: unknown }>, areaName: string) => {
    if (areaName !== "local" || !changes[CONFIG_STORAGE_KEY])
      return

    registration?.unregister()
    const nextConfig = changes[CONFIG_STORAGE_KEY].newValue as Config | undefined
    registration = registerShortcut(nextConfig?.translate.page.shortcut, onToggle)
  }

  browser.storage.onChanged.addListener(handleStorageChange)

  return () => {
    registration?.unregister()
    browser.storage.onChanged.removeListener(handleStorageChange)
  }
}

function registerShortcut(shortcut: string | undefined, onToggle: () => void): HotkeyRegistrationHandle | null {
  if (!shortcut || isPageTranslationShortcutEmpty(shortcut) || !isValidConfiguredPageTranslationShortcut(shortcut))
    return null

  return HotkeyManager.getInstance().register(shortcut as Hotkey, onToggle, {
    ignoreInputs: true,
    preventDefault: true,
    stopPropagation: true,
  })
}
