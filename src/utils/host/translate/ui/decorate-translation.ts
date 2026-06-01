import type { TranslationNodeStyleConfig } from "@/types/config/translate"
import { camelCase } from "case-anything"
import { translationNodeStylePresetSchema } from "@/types/config/translate"
import { CUSTOM_TRANSLATION_NODE_ATTRIBUTE } from "@/utils/constants/translation-node-style"
import { getContainingShadowRoot } from "../../dom/node"
import { ensurePresetStyles } from "./style-injector"

const customTranslationNodeAttribute = camelCase(CUSTOM_TRANSLATION_NODE_ATTRIBUTE)

export function decorateTranslationNode(
  translatedNode: HTMLElement,
  styleConfig: TranslationNodeStyleConfig,
): void {
  if (translationNodeStylePresetSchema.safeParse(styleConfig.preset).error)
    return

  const root = getContainingShadowRoot(translatedNode) ?? document
  translatedNode.dataset[customTranslationNodeAttribute] = styleConfig.preset
  ensurePresetStyles(root)
}
