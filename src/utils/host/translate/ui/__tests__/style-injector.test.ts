// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest"

async function loadStyleInjector() {
  vi.resetModules()

  vi.doMock("@/assets/styles/custom-translation-node.css?raw", () => ({
    default: "@import '@/assets/styles/host-theme.css';\n[data-tl-custom-translation-style='blur'] { opacity: 0.75; }",
  }))
  vi.doMock("@/assets/styles/host-theme.css?raw", () => ({
    default: ":root { --tl-primary: oklch(0.205 0 0); --tl-brand: oklch(56% 0.12 153); }",
  }))
  vi.doMock("@/assets/styles/translation-node-preset.css?raw", () => ({
    default: ".tl-translated-content-wrapper { display: inline; }",
  }))

  return import("../style-injector")
}

describe("style-injector", () => {
  beforeEach(() => {
    document.head.innerHTML = ""
    document.body.innerHTML = ""

    Object.defineProperty(document, "adoptedStyleSheets", {
      configurable: true,
      value: undefined,
    })
  })

  it("injects preset styles into the document", async () => {
    const { ensurePresetStyles } = await loadStyleInjector()

    ensurePresetStyles(document)

    const presetStyle = document.head.querySelector<HTMLStyleElement>("#tl-preset-styles")
    expect(presetStyle).not.toBeNull()
    expect(presetStyle?.textContent).toContain(".tl-translated-content-wrapper")
    expect(presetStyle?.textContent).toContain(":root")
    expect(presetStyle?.textContent).not.toContain(":host")
  })

  it("uses adoptedStyleSheets for document preset styles when available", async () => {
    const { ensurePresetStyles } = await loadStyleInjector()

    Object.defineProperty(document, "adoptedStyleSheets", {
      configurable: true,
      value: [],
      writable: true,
    })

    ensurePresetStyles(document)

    expect(document.adoptedStyleSheets).toHaveLength(1)
    expect(document.adoptedStyleSheets[0]?.cssRules[0]?.cssText).toContain("--tl-brand")
    expect(document.head.querySelector("#tl-preset-styles")).toBeNull()
  })

  it("falls back to style elements when adoptedStyleSheets assignment throws", async () => {
    const { ensurePresetStyles } = await loadStyleInjector()
    const adoptedStyleSheets: CSSStyleSheet[] = []

    Object.defineProperty(document, "adoptedStyleSheets", {
      configurable: true,
      get() {
        return adoptedStyleSheets
      },
      set() {
        throw new Error("Xray wrapper")
      },
    })

    ensurePresetStyles(document)

    const presetStyle = document.head.querySelector<HTMLStyleElement>("#tl-preset-styles")
    expect(presetStyle).not.toBeNull()
    expect(adoptedStyleSheets).toHaveLength(0)
  })

  it("injects preset styles into shadow roots with :host variables", async () => {
    const { ensurePresetStyles } = await loadStyleInjector()
    const host = document.createElement("div")
    const shadow = host.attachShadow({ mode: "open" })

    Object.defineProperty(shadow, "adoptedStyleSheets", {
      configurable: true,
      value: undefined,
    })

    ensurePresetStyles(shadow)

    const presetStyle = shadow.querySelector<HTMLStyleElement>("#tl-preset-styles")
    expect(presetStyle).not.toBeNull()
    expect(presetStyle?.textContent).toContain(".tl-translated-content-wrapper")
    expect(presetStyle?.textContent).toContain(":host")
    expect(presetStyle?.textContent).not.toContain(":root {")
  })
})
