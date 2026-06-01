import type { TranslatePromptResult } from "./translate"
import type { SubtitlePromptContext } from "@/types/content"
import {
  DEFAULT_BATCH_TRANSLATE_PROMPT,
  DEFAULT_SUBTITLE_TRANSLATE_SYSTEM_PROMPT,
  DEFAULT_TRANSLATE_PROMPT,
  getTokenCellText,
  INPUT,
  TARGET_LANGUAGE,
  VIDEO_SUMMARY,
  VIDEO_TITLE,
} from "../constants/prompt"
import { normalizePromptContextValue } from "../host/translate/translate-text"

interface SubtitlesPromptOptions {
  isBatch?: boolean
  context?: SubtitlePromptContext
}

function promptValue(value: string | null | undefined, fallback: string): string {
  return normalizePromptContextValue(value) ?? fallback
}

export async function getSubtitlesTranslatePrompt(
  targetLang: string,
  input: string,
  options?: SubtitlesPromptOptions,
): Promise<TranslatePromptResult> {
  const systemPrompt = options?.isBatch
    ? `${DEFAULT_SUBTITLE_TRANSLATE_SYSTEM_PROMPT}\n\n${DEFAULT_BATCH_TRANSLATE_PROMPT}`
    : DEFAULT_SUBTITLE_TRANSLATE_SYSTEM_PROMPT
  const title = promptValue(options?.context?.videoTitle, "No title available")
  const summary = promptValue(options?.context?.videoSummary, "No summary available")

  const replaceTokens = (text: string) => text
    .replaceAll(getTokenCellText(TARGET_LANGUAGE), targetLang)
    .replaceAll(getTokenCellText(INPUT), input)
    .replaceAll(getTokenCellText(VIDEO_TITLE), title)
    .replaceAll(getTokenCellText(VIDEO_SUMMARY), summary)

  return {
    systemPrompt: replaceTokens(systemPrompt),
    prompt: replaceTokens(DEFAULT_TRANSLATE_PROMPT),
  }
}
