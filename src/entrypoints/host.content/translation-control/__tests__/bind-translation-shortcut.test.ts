import type { Config } from "@/types/config/config"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { bindTranslationShortcutKey } from "../bind-translation-shortcut"

const register = vi.fn()
const unregister = vi.fn()
const addStorageListener = vi.fn()
const removeStorageListener = vi.fn()

vi.mock("@tanstack/hotkeys", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/hotkeys")>()
  return {
    ...actual,
    HotkeyManager: {
      getInstance: () => ({ register }),
    },
  }
})

vi.mock("#imports", () => ({
  browser: {
    storage: {
      onChanged: {
        addListener: addStorageListener,
        removeListener: removeStorageListener,
      },
    },
  },
}))

function config(shortcut: string): Config {
  return {
    translate: {
      page: {
        shortcut,
      },
    },
  } as Config
}

describe("bindTranslationShortcutKey", () => {
  beforeEach(() => {
    register.mockReset()
    unregister.mockReset()
    addStorageListener.mockReset()
    removeStorageListener.mockReset()
    register.mockReturnValue({ unregister })
  })

  it("registers the configured shortcut before host runtime loads", () => {
    const onToggle = vi.fn()

    const cleanup = bindTranslationShortcutKey(config("Alt+E"), onToggle)

    expect(register).toHaveBeenCalledWith("Alt+E", onToggle, {
      ignoreInputs: true,
      preventDefault: true,
      stopPropagation: true,
    })

    cleanup()
    expect(unregister).toHaveBeenCalled()
  })

  it("skips empty shortcuts", () => {
    bindTranslationShortcutKey(config(""), vi.fn())

    expect(register).not.toHaveBeenCalled()
  })
})
