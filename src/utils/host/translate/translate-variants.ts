import type { Config } from "@/types/config/config"
import type { LangCodeISO6393 } from "@/utils/languages/definitions"
import { detectLanguage } from "@/utils/content/language"
import { logger } from "@/utils/logger"
import { getLocalConfig } from "../../config/storage"
import { resolveProviderConfig } from "../../constants/feature-providers"
import { prepareTranslationText } from "./text-preparation"
import { MIN_LENGTH_FOR_SKIP_LLM_DETECTION, shouldSkipByLanguage, translateTextCore } from "./translate-text"

const MIN_LENGTH_FOR_TARGET_LANG_DETECTION = 50

async function getConfigOrThrow(): Promise<Config> {
  const config = await getLocalConfig()
  if (!config) {
    throw new Error("No global config when translate text")
  }
  return config
}

async function isTextAlreadyInTargetLanguage(text: string, targetCode: LangCodeISO6393) {
  if (text.length < MIN_LENGTH_FOR_TARGET_LANG_DETECTION)
    return false
  const detected = await detectLanguage(text, { enableLLM: false })
  return detected === targetCode
}

async function translateTextUsingPageConfig(
  config: Config,
  text: string,
  options: { extraHashTags?: string[] } = {},
): Promise<string> {
  const preparedText = prepareTranslationText(text)
  if (preparedText === "") {
    return ""
  }

  const providerConfig = resolveProviderConfig(config, "translate")

  if (
    config.translate.page.enableTargetLanguageSkip
    && await isTextAlreadyInTargetLanguage(preparedText, config.language.targetCode)
  ) {
    logger.info(`translateTextForPage: skipping translation because text is already in target language. text: ${preparedText}`)
    return ""
  }

  const { skipLanguages } = config.translate.page
  if (skipLanguages.length > 0 && preparedText.length >= MIN_LENGTH_FOR_SKIP_LLM_DETECTION) {
    const shouldSkip = await shouldSkipByLanguage(
      preparedText,
      skipLanguages,
      config.languageDetection.mode === "llm",
    )
    if (shouldSkip) {
      logger.info(`translateTextForPage: skipping translation because text is in skip language list. text: ${preparedText}`)
      return ""
    }
  }

  return translateTextCore({
    text: preparedText,
    langConfig: config.language,
    providerConfig,
    extraHashTags: options.extraHashTags,
  })
}

export async function translateTextForPage(text: string): Promise<string> {
  return translateTextUsingPageConfig(await getConfigOrThrow(), text)
}

export async function translateTextForPageTitle(text: string): Promise<string> {
  return translateTextUsingPageConfig(await getConfigOrThrow(), text, {
    extraHashTags: ["pageTitleTranslation"],
  })
}
