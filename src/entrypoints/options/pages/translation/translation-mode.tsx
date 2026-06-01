import type { TranslationMode as TranslationModeType } from "@/types/config/translate"
import { deepmerge } from "deepmerge-ts"
import { useAtom } from "jotai"
import { i18n } from "#imports"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base-ui/select"
import { TRANSLATION_MODES } from "@/types/config/translate"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { ConfigCard } from "../../components/config-card"

export function TranslationMode() {
  return (
    <ConfigCard id="translation-mode" inline title={i18n.t("options.translation.translationMode.title")}>
      <TranslationModeSelector />
    </ConfigCard>
  )
}

function TranslationModeSelector() {
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  const currentMode = translateConfig.mode

  const handleModeChange = (mode: TranslationModeType | null) => {
    if (!mode)
      return

    void setTranslateConfig(
      deepmerge(translateConfig, { mode }),
    )
  }

  return (
    <Select
      value={currentMode}
      onValueChange={handleModeChange}
    >
      <SelectTrigger className="w-44">
        <SelectValue render={<span />}>
          {i18n.t(`options.translation.translationMode.mode.${currentMode}`)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {TRANSLATION_MODES.map(mode => (
            <SelectItem key={mode} value={mode}>
              {i18n.t(`options.translation.translationMode.mode.${mode}`)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
