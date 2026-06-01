import type { TranslationNodeStylePreset } from "@/types/config/translate"
import { useAtom } from "jotai"
import { i18n } from "#imports"
import { Field, FieldLabel } from "@/components/ui/base-ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/base-ui/select"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { TRANSLATION_NODE_STYLE } from "@/utils/constants/translation-node-style"

export function PresetStyleSelector() {
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  const { translationNodeStyle } = translateConfig

  return (
    <Field>
      <FieldLabel htmlFor="preset-style-selector">
        {i18n.t("options.translation.translationStyle.presetStyle")}
      </FieldLabel>
      <Select
        value={translationNodeStyle.preset}
        onValueChange={(preset: TranslationNodeStylePreset | null) => {
          if (preset) {
            void setTranslateConfig({
              ...translateConfig,
              translationNodeStyle: { preset },
            })
          }
        }}
      >
        <SelectTrigger id="preset-style-selector" className="w-40">
          <SelectValue>
            {i18n.t(`options.translation.translationStyle.style.${translationNodeStyle.preset}`)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {TRANSLATION_NODE_STYLE.map(nodeStyle => (
              <SelectItem key={nodeStyle} value={nodeStyle}>
                {i18n.t(`options.translation.translationStyle.style.${nodeStyle}`)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
