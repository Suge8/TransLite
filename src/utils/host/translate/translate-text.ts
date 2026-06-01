import type { Config } from "@/types/config/config"
import type { ProviderConfig } from "@/types/config/provider"
import type { LangCodeISO6393, LangLevel } from "@/utils/languages/definitions"
import { toast } from "sonner"
import { i18n } from "#imports"
import { isAPIProviderConfig, isLLMProviderConfig } from "@/types/config/provider"
import { getProviderConfigById } from "@/utils/config/helpers"
import { detectLanguage } from "@/utils/content/language"

import { LANG_CODE_TO_EN_NAME } from "@/utils/languages/definitions"
import { logger } from "@/utils/logger"
import { getTranslatePrompt } from "@/utils/prompts/translate"
import { Sha256Hex } from "../../hash"
import { sendMessage } from "../../message"
import { prepareTranslationText } from "./text-preparation"

export const MIN_LENGTH_FOR_SKIP_LLM_DETECTION = 10

export async function shouldSkipByLanguage(
  text: string,
  skipLanguages: LangCodeISO6393[],
  enableLLM: boolean,
): Promise<boolean> {
  const detectedLang = await detectLanguage(text, {
    minLength: MIN_LENGTH_FOR_SKIP_LLM_DETECTION,
    enableLLM,
  })

  return detectedLang ? skipLanguages.includes(detectedLang) : false
}

export function normalizePromptContextValue(value: string | null | undefined): string | null | undefined {
  if (value == null) {
    return value
  }
  return value.trim() === "" ? null : value
}

async function buildPageTranslationHashComponents(
  text: string,
  providerConfig: ProviderConfig,
  langConfig: { sourceCode: LangCodeISO6393 | "auto", targetCode: LangCodeISO6393 },
): Promise<string[]> {
  const preparedText = prepareTranslationText(text)
  const hashComponents = [
    preparedText,
    JSON.stringify(providerConfig),
    langConfig.sourceCode,
    langConfig.targetCode,
  ]

  if (isLLMProviderConfig(providerConfig)) {
    const targetLangName = LANG_CODE_TO_EN_NAME[langConfig.targetCode]
    const { systemPrompt, prompt } = await getTranslatePrompt(targetLangName, preparedText, { isBatch: true })
    hashComponents.push(systemPrompt, prompt)
  }

  return hashComponents
}

export interface TranslateTextOptions {
  text: string
  langConfig: { sourceCode: LangCodeISO6393 | "auto", targetCode: LangCodeISO6393, level: LangLevel }
  providerConfig: ProviderConfig
  extraHashTags?: string[]
}

export async function translateTextCore(options: TranslateTextOptions): Promise<string> {
  const {
    text,
    langConfig,
    providerConfig,
    extraHashTags = [],
  } = options

  const preparedText = prepareTranslationText(text)
  if (preparedText === "") {
    return ""
  }

  const hashComponents = await buildPageTranslationHashComponents(
    preparedText,
    providerConfig,
    { sourceCode: langConfig.sourceCode, targetCode: langConfig.targetCode },
  )
  hashComponents.push(...extraHashTags)

  return await sendMessage("enqueueTranslateRequest", {
    text: preparedText,
    langConfig,
    providerConfig,
    scheduleAt: Date.now(),
    hash: Sha256Hex(...hashComponents),
  })
}

export function validateTranslationConfigAndToast(
  config: Pick<Config, "providersConfig" | "translate" | "language">,
): boolean {
  const { providersConfig, translate: translateConfig, language: languageConfig } = config
  const providerConfig = getProviderConfigById(providersConfig, translateConfig.providerId)
  if (!providerConfig) {
    return false
  }

  if (languageConfig.sourceCode === languageConfig.targetCode) {
    toast.error(i18n.t("translation.sameLanguage"))
    logger.info("validateTranslationConfig: returning false (same language)")
    return false
  }

  if (isAPIProviderConfig(providerConfig) && !providerConfig.apiKey?.trim() && providerConfig.provider !== "ollama") {
    toast.error(i18n.t("noAPIKeyConfig.warning"))
    logger.info("validateTranslationConfig: returning false (no API key)")
    return false
  }

  return true
}
