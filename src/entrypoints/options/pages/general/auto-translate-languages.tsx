import type { LangCodeISO6393 } from "@/utils/languages/definitions"
import { Icon } from "@iconify/react"
import { useAtom } from "jotai"
import { i18n } from "#imports"
import { MultiLanguageCombobox } from "@/components/multi-language-combobox"
import { Button } from "@/components/ui/base-ui/button"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { getLanguageLabel } from "@/utils/language-labels"
import { ConfigCard } from "../../components/config-card"

export function AutoTranslateLanguages() {
  return (
    <ConfigCard
      id="auto-translate-languages"
      title={i18n.t("options.general.autoTranslateLanguages.title")}
      description={i18n.t("options.general.autoTranslateLanguages.description")}
    >
      <div className="flex flex-col gap-3">
        <AutoTranslateLanguagesSelector />
        <SelectedLanguageCells />
      </div>
    </ConfigCard>
  )
}

function AutoTranslateLanguagesSelector() {
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  const selectedLanguages = translateConfig.page.autoTranslateLanguages

  return (
    <div className="w-full flex justify-start md:justify-end">
      <MultiLanguageCombobox
        selectedLanguages={selectedLanguages}
        onLanguagesChange={languages =>
          void setTranslateConfig({
            page: {
              ...translateConfig.page,
              autoTranslateLanguages: languages,
            },
          })}
        buttonLabel={i18n.t("options.general.autoTranslateLanguages.selectLanguages")}
      />
    </div>
  )
}

function SelectedLanguageCells() {
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  const selectedLanguages = translateConfig.page.autoTranslateLanguages

  const removeLanguage = (language: LangCodeISO6393) => {
    void setTranslateConfig({
      page: {
        ...translateConfig.page,
        autoTranslateLanguages: selectedLanguages.filter(lang => lang !== language),
      },
    })
  }

  if (selectedLanguages.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selectedLanguages.map(language => (
        <div
          key={language}
          className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-sm"
        >
          <span>{getLanguageLabel(language)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-input hover:text-input-foreground"
            onClick={() => removeLanguage(language)}
          >
            <Icon icon="tabler:x" className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}
