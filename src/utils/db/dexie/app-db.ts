import type { EntityTable } from "dexie"
import { upperCamelCase } from "case-anything"
import Dexie from "dexie"
import { APP_NAME } from "@/utils/constants/app"
import AiSegmentationCache from "./tables/ai-segmentation-cache"
import TranslationCache from "./tables/translation-cache"

export default class AppDB extends Dexie {
  translationCache!: EntityTable<TranslationCache, "key">
  aiSegmentationCache!: EntityTable<AiSegmentationCache, "key">

  constructor() {
    super(`${upperCamelCase(APP_NAME)}DB`)
    this.version(1).stores({
      translationCache: `
        key,
        translation,
        createdAt`,
      aiSegmentationCache: `
        key,
        createdAt`,
    })
    this.translationCache.mapToClass(TranslationCache)
    this.aiSegmentationCache.mapToClass(AiSegmentationCache)
  }
}
