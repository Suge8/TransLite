import customTranslationNodeCss from "@/assets/styles/custom-translation-node.css?raw"
import hostThemeCss from "@/assets/styles/host-theme.css?raw"
import translationNodePresetCss from "@/assets/styles/translation-node-preset.css?raw"
import { logger } from "@/utils/logger"

type StyleRoot = Document | ShadowRoot

const constructableStyleSheetSupportMap = new WeakMap<StyleRoot, boolean>()

function supportsConstructableStyleSheets(root: StyleRoot): root is StyleRoot & { adoptedStyleSheets: CSSStyleSheet[] } {
  const cachedSupport = constructableStyleSheetSupportMap.get(root)
  if (cachedSupport !== undefined) {
    return cachedSupport
  }

  try {
    if (typeof CSSStyleSheet === "undefined" || !("adoptedStyleSheets" in root) || root.adoptedStyleSheets === undefined) {
      constructableStyleSheetSupportMap.set(root, false)
      return false
    }

    const probeSheet = new CSSStyleSheet()
    const previousSheets = [...root.adoptedStyleSheets]

    try {
      root.adoptedStyleSheets = [...previousSheets, probeSheet]
      const supportsAssignment = [...root.adoptedStyleSheets].includes(probeSheet)
      constructableStyleSheetSupportMap.set(root, supportsAssignment)
      return supportsAssignment
    }
    finally {
      root.adoptedStyleSheets = previousSheets
    }
  }
  catch (error) {
    logger.warn("[style-injector] constructable stylesheet assignment failed, falling back to <style>", error)
    constructableStyleSheetSupportMap.set(root, false)
    return false
  }
}

function injectStyleElement(root: StyleRoot, id: string, cssText: string): void {
  const container = root instanceof Document ? root.head : root
  let styleElement = root.querySelector(`#${id}`) as HTMLStyleElement | null
  if (!styleElement) {
    styleElement = document.createElement("style")
    styleElement.id = id
    container.appendChild(styleElement)
  }
  if (styleElement.textContent !== cssText) {
    styleElement.textContent = cssText
  }
}

const BASE_PRESET_CSS = customTranslationNodeCss.replace(/@import[^;]+;/g, "") + translationNodePresetCss
const DOCUMENT_PRESET_CSS = hostThemeCss + BASE_PRESET_CSS
const SHADOW_PRESET_CSS = hostThemeCss.replace(/:root/g, ":host") + BASE_PRESET_CSS

const injectedPresetRoots = new WeakSet<StyleRoot>()
let documentPresetStyleSheet: CSSStyleSheet | null = null
let shadowPresetStyleSheet: CSSStyleSheet | null = null

function getPresetCSS(root: StyleRoot): string {
  return root instanceof Document ? DOCUMENT_PRESET_CSS : SHADOW_PRESET_CSS
}

function getPresetStyleSheet(root: StyleRoot): CSSStyleSheet {
  if (root instanceof Document) {
    documentPresetStyleSheet ??= new CSSStyleSheet()
    documentPresetStyleSheet.replaceSync(DOCUMENT_PRESET_CSS)
    return documentPresetStyleSheet
  }

  shadowPresetStyleSheet ??= new CSSStyleSheet()
  shadowPresetStyleSheet.replaceSync(SHADOW_PRESET_CSS)
  return shadowPresetStyleSheet
}

export function ensurePresetStyles(root: StyleRoot): void {
  if (injectedPresetRoots.has(root))
    return

  injectedPresetRoots.add(root)

  if (supportsConstructableStyleSheets(root)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, getPresetStyleSheet(root)]
  }
  else {
    injectStyleElement(root, "tl-preset-styles", getPresetCSS(root))
  }
}
