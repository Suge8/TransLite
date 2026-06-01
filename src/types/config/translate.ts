import { z } from "zod"
import { MAX_PRELOAD_MARGIN, MAX_PRELOAD_THRESHOLD, MIN_BATCH_CHARACTERS, MIN_BATCH_ITEMS, MIN_PRELOAD_MARGIN, MIN_PRELOAD_THRESHOLD, MIN_TRANSLATE_CAPACITY, MIN_TRANSLATE_RATE } from "@/utils/constants/translate"
import { TRANSLATION_NODE_STYLE } from "@/utils/constants/translation-node-style"
import { langCodeISO6393Schema } from "@/utils/languages/definitions"
import { isPageTranslationShortcutEmpty, isValidConfiguredPageTranslationShortcut } from "@/utils/page-translation-shortcut"

export const requestQueueConfigSchema = z.object({
  capacity: z.number().gte(MIN_TRANSLATE_CAPACITY),
  rate: z.number().gte(MIN_TRANSLATE_RATE),
})

export const batchQueueConfigSchema = z.object({
  maxCharactersPerBatch: z.number().gte(MIN_BATCH_CHARACTERS),
  maxItemsPerBatch: z.number().gte(MIN_BATCH_ITEMS),
})

export const TRANSLATION_MODES = ["bilingual", "translationOnly"] as const
export const translationModeSchema = z.enum(TRANSLATION_MODES)

export const pageTranslateRangeSchema = z.enum(["main", "all"])
export type PageTranslateRange = z.infer<typeof pageTranslateRangeSchema>

export const preloadConfigSchema = z.object({
  margin: z.number().min(MIN_PRELOAD_MARGIN).max(MAX_PRELOAD_MARGIN),
  threshold: z.number().min(MIN_PRELOAD_THRESHOLD).max(MAX_PRELOAD_THRESHOLD),
})
export type PreloadConfig = z.infer<typeof preloadConfigSchema>

export const translationNodeStylePresetSchema = z.enum(TRANSLATION_NODE_STYLE)
export type TranslationNodeStylePreset = z.infer<typeof translationNodeStylePresetSchema>

export const translationNodeStyleConfigSchema = z.strictObject({
  preset: translationNodeStylePresetSchema,
})

export type TranslationNodeStyleConfig = z.infer<typeof translationNodeStyleConfigSchema>

export const pageTranslationShortcutSchema = z.string().superRefine((shortcut, ctx) => {
  if (isPageTranslationShortcutEmpty(shortcut)) {
    return
  }

  if (!isValidConfiguredPageTranslationShortcut(shortcut)) {
    ctx.addIssue({
      code: "custom",
      message: "Page translation shortcut must include at least one modifier key and one non-modifier key.",
    })
  }
})

export const translateConfigSchema = z.object({
  providerId: z.string().nonempty(),
  mode: translationModeSchema,
  page: z.object({
    range: pageTranslateRangeSchema,
    autoTranslatePatterns: z.array(z.string()),
    autoTranslateLanguages: z.array(langCodeISO6393Schema),
    shortcut: pageTranslationShortcutSchema,
    preload: preloadConfigSchema,
    enableTargetLanguageSkip: z.boolean(),
    skipLanguages: z.array(langCodeISO6393Schema),
  }),
  requestQueueConfig: requestQueueConfigSchema,
  batchQueueConfig: batchQueueConfigSchema,
  translationNodeStyle: translationNodeStyleConfigSchema,
})

export type RequestQueueConfig = z.infer<typeof requestQueueConfigSchema>
export type BatchQueueConfig = z.infer<typeof batchQueueConfigSchema>
export type TranslateConfig = z.infer<typeof translateConfigSchema>
export type TranslationMode = z.infer<typeof translationModeSchema>
