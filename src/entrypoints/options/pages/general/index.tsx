import { i18n } from "#imports"
import { PageLayout } from "../../components/page-layout"
import { SettingsGroup } from "../../components/settings-group"
import AppearanceSettings from "./appearance-settings"
import { AutoTranslateLanguages } from "./auto-translate-languages"
import FeatureProvidersConfig from "./feature-providers-config"
import LanguageDetectionConfig from "./language-detection-config"
import { PageTranslationShortcut } from "./page-translation-shortcut"
import { ResetConfig } from "./reset-config"
import SiteControlMode from "./site-control-mode"

export function GeneralPage() {
  return (
    <PageLayout>
      <SettingsGroup label={i18n.t("options.groups.source")}>
        <FeatureProvidersConfig />
        <AutoTranslateLanguages />
        <LanguageDetectionConfig />
        <PageTranslationShortcut />
      </SettingsGroup>
      <SettingsGroup label={i18n.t("options.groups.siteAppearance")}>
        <SiteControlMode />
        <AppearanceSettings />
      </SettingsGroup>
      <SettingsGroup label={i18n.t("options.groups.data")}>
        <ResetConfig />
      </SettingsGroup>
    </PageLayout>
  )
}
