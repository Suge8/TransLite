import { i18n } from "#imports"
import { PageLayout } from "../../components/page-layout"
import { SettingsGroup } from "../../components/settings-group"
import { AutoTranslateSites } from "./auto-translate-sites"
import { ClearCacheConfig } from "./clear-cache-config"
import { TranslationStyle } from "./custom-translation-style"
import { PreloadConfig } from "./preload-config"
import { RequestBatch } from "./request-batch"
import { RequestRate } from "./request-rate"
import { SkipLanguages } from "./skip-languages"
import { TranslateRange } from "./translate-range"
import { TranslationMode } from "./translation-mode"

export function TranslationPage() {
  return (
    <PageLayout>
      <SettingsGroup label={i18n.t("options.groups.display")}>
        <TranslationMode />
        <TranslateRange />
        <TranslationStyle />
      </SettingsGroup>
      <SettingsGroup label={i18n.t("options.groups.automation")}>
        <AutoTranslateSites />
        <SkipLanguages />
      </SettingsGroup>
      <SettingsGroup label={i18n.t("options.groups.performance")}>
        <RequestRate />
        <RequestBatch />
        <PreloadConfig />
        <ClearCacheConfig />
      </SettingsGroup>
    </PageLayout>
  )
}
