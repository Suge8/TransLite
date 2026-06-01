import { browser } from "#imports"
import { db } from "@/utils/db/dexie/db"
import { logger } from "@/utils/logger"

export const CHECK_INTERVAL_MINUTES = 24 * 60
export const TRANSLATION_CACHE_CLEANUP_ALARM = "cache-cleanup"
export const TRANSLATION_CACHE_MAX_AGE_MINUTES = 7 * 24 * 60

export async function setUpDatabaseCleanup() {
  const existingCacheAlarm = await browser.alarms.get(TRANSLATION_CACHE_CLEANUP_ALARM)
  if (!existingCacheAlarm) {
    void browser.alarms.create(TRANSLATION_CACHE_CLEANUP_ALARM, {
      delayInMinutes: 1,
      periodInMinutes: CHECK_INTERVAL_MINUTES,
    })
  }

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === TRANSLATION_CACHE_CLEANUP_ALARM) {
      await cleanupOldTranslationCache()
    }
  })
}

async function cleanupOldTranslationCache() {
  try {
    const cutoffDate = new Date()
    cutoffDate.setTime(cutoffDate.getTime() - TRANSLATION_CACHE_MAX_AGE_MINUTES * 60 * 1000)
    const deletedCount = await db.translationCache.where("createdAt").below(cutoffDate).delete()

    if (deletedCount > 0) {
      logger.info(`Cache cleanup: Deleted ${deletedCount} old translation cache entries`)
    }
  }
  catch (error) {
    logger.error("Failed to cleanup old cache:", error)
  }
}

export async function cleanupAllTranslationCache() {
  try {
    await db.translationCache.clear()
    logger.info("Cache cleanup: Deleted all translation cache entries")
  }
  catch (error) {
    logger.error("Failed to cleanup all cache:", error)
    throw error
  }
}

export async function cleanupAllAiSegmentationCache() {
  try {
    await db.aiSegmentationCache.clear()
    logger.info("AI segmentation cache cleanup: Deleted all entries")
  }
  catch (error) {
    logger.error("Failed to cleanup all AI segmentation cache:", error)
    throw error
  }
}
