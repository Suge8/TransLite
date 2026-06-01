import { useAtom, useAtomValue } from "jotai"
import { browser, i18n } from "#imports"
import { MultiLanguageCombobox } from "@/components/multi-language-combobox"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { detectedCodeAtom } from "@/utils/atoms/detected-code"
import { getLanguageLabel } from "@/utils/language-labels"
import { sendMessage } from "@/utils/message"

export function AutoTranslateLanguagesField() {
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  const selectedLanguages = translateConfig.page.autoTranslateLanguages
  const detectedCode = useAtomValue(detectedCodeAtom)

  const buttonLabel = selectedLanguages.length === 0
    ? i18n.t("popup.autoTranslateLanguages.none")
    : selectedLanguages.length === 1
      ? getLanguageLabel(selectedLanguages[0])
      : i18n.t("popup.autoTranslateLanguages.count", [selectedLanguages.length])

  const updateLanguages = async (languages: typeof selectedLanguages) => {
    void setTranslateConfig({
      page: {
        ...translateConfig.page,
        autoTranslateLanguages: languages,
      },
    })

    if (selectedLanguages.includes(detectedCode) && !languages.includes(detectedCode)) {
      const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (currentTab.id) {
        void sendMessage("tryToSetEnablePageTranslationByTabId", {
          tabId: currentTab.id,
          enabled: false,
        })
      }
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium">
        {i18n.t("popup.autoTranslateLanguages.title")}
      </span>
      <MultiLanguageCombobox
        selectedLanguages={selectedLanguages}
        onLanguagesChange={languages => void updateLanguages(languages)}
        buttonLabel={buttonLabel}
        className="h-7! w-31 cursor-pointer pr-1.5 pl-2.5"
        clearLabel={i18n.t("popup.autoTranslateLanguages.clear")}
        contentAlign="end"
      />
    </div>
  )
}
