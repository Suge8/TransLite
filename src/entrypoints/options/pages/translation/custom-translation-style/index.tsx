import { i18n } from "#imports"
import { FieldGroup } from "@/components/ui/base-ui/field"
import { ConfigCard } from "@/entrypoints/options/components/config-card"
import { PresetStyleSelector } from "./preset-style-selector"
import { StylePreview } from "./style-preview"

export function TranslationStyle() {
  return (
    <ConfigCard id="translation-style" title={i18n.t("options.translation.translationStyle.title")}>
      <FieldGroup>
        <PresetStyleSelector />
        <StylePreview />
      </FieldGroup>
    </ConfigCard>
  )
}
