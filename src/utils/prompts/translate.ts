import {
  DEFAULT_BATCH_TRANSLATE_PROMPT,
  DEFAULT_TRANSLATE_PROMPT,
  DEFAULT_TRANSLATE_SYSTEM_PROMPT,
  getTokenCellText,
  INPUT,
  TARGET_LANGUAGE,
} from "../constants/prompt"

export interface TranslatePromptOptions<TContext = unknown> {
  isBatch?: boolean
  context?: TContext
}

export interface TranslatePromptResult {
  systemPrompt: string
  prompt: string
}

function replacePromptTokens(text: string, targetLang: string, input: string) {
  return text
    .replaceAll(getTokenCellText(TARGET_LANGUAGE), targetLang)
    .replaceAll(getTokenCellText(INPUT), input)
}

export function getTranslatePromptFromConfig(
  targetLang: string,
  input: string,
  options?: TranslatePromptOptions,
): TranslatePromptResult {
  const systemPrompt = options?.isBatch
    ? `${DEFAULT_TRANSLATE_SYSTEM_PROMPT}\n\n${DEFAULT_BATCH_TRANSLATE_PROMPT}`
    : DEFAULT_TRANSLATE_SYSTEM_PROMPT

  return {
    systemPrompt: replacePromptTokens(systemPrompt, targetLang, input),
    prompt: replacePromptTokens(DEFAULT_TRANSLATE_PROMPT, targetLang, input),
  }
}

export async function getTranslatePrompt(
  targetLang: string,
  input: string,
  options?: TranslatePromptOptions,
): Promise<TranslatePromptResult> {
  return getTranslatePromptFromConfig(targetLang, input, options)
}
