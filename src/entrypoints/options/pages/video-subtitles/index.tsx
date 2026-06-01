import { i18n } from "#imports"
import { PageLayout } from "../../components/page-layout"
import { SettingsGroup } from "../../components/settings-group"
import { ClearAiSegmentationCache } from "./clear-ai-segmentation-cache"
import { SubtitlesConfig } from "./subtitles-config"
import { SubtitlesRequestBatch } from "./subtitles-request-batch"
import { SubtitlesRequestRate } from "./subtitles-request-rate"
import { SubtitlesStyleSettings } from "./subtitles-style-settings"

export function VideoSubtitlesPage() {
  return (
    <PageLayout>
      <SettingsGroup label={i18n.t("options.groups.subtitle")}>
        <SubtitlesConfig />
        <SubtitlesStyleSettings />
      </SettingsGroup>
      <SettingsGroup label={i18n.t("options.groups.performance")}>
        <SubtitlesRequestRate />
        <SubtitlesRequestBatch />
        <ClearAiSegmentationCache />
      </SettingsGroup>
    </PageLayout>
  )
}
