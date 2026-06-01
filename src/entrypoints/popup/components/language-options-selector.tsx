import type { LanguageItem } from "@/components/language-combobox-options"
import type { LangCodeISO6393 } from "@/utils/languages/definitions"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { Icon } from "@iconify/react"
import { IconChevronDown } from "@tabler/icons-react"
import { useAtom, useAtomValue } from "jotai"
import { useMemo } from "react"
import { i18n } from "#imports"
import { filterLanguage } from "@/components/language-combobox-options"
import { Button } from "@/components/ui/base-ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/base-ui/combobox"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { detectedCodeAtom } from "@/utils/atoms/detected-code"
import { getLanguageLabel, getLanguageName } from "@/utils/language-labels"
import { langCodeISO6393Schema } from "@/utils/languages/definitions"

function createLanguageItem(code: LangCodeISO6393): LanguageItem<LangCodeISO6393> {
  return {
    value: code,
    label: getLanguageLabel(code),
    name: getLanguageName(code),
  }
}

const langSelectorTriggerClasses = "!h-14 flex-1 min-w-0 rounded-xl shadow-xs pr-2 gap-1 justify-between border-border/70 bg-card/60 backdrop-blur-sm transition-colors hover:border-brand/45 hover:bg-card"

const langSelectorContentClasses = "flex flex-col items-start text-base font-medium min-w-0 flex-1"

function LanguageComboboxTrigger({
  label,
  subtitle,
  ariaLabel,
}: {
  label: string
  subtitle: string
  ariaLabel: string
}) {
  return (
    <ComboboxPrimitive.Trigger
      render={(
        <Button
          type="button"
          variant="outline"
          className={langSelectorTriggerClasses}
          aria-label={ariaLabel}
          title={label}
        />
      )}
    >
      <div className={langSelectorContentClasses}>
        <span className="truncate w-full text-left">{label}</span>
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      </div>
      <IconChevronDown className="size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  )
}

export default function LanguageOptionsSelector() {
  const [language, setLanguage] = useAtom(configFieldsAtomMap.language)
  const detectedCode = useAtomValue(detectedCodeAtom)
  const targetLanguageItems = useMemo(
    () => langCodeISO6393Schema.options.map(createLanguageItem),
    [],
  )
  const sourceLanguageItems = useMemo<LanguageItem[]>(
    () => [
      {
        value: "auto",
        label: getLanguageLabel(detectedCode),
        name: getLanguageName(detectedCode),
      },
      ...targetLanguageItems,
    ],
    [detectedCode, targetLanguageItems],
  )
  const currentSourceItem = useMemo(
    () => sourceLanguageItems.find(item => item.value === language.sourceCode) ?? sourceLanguageItems[0] ?? null,
    [language.sourceCode, sourceLanguageItems],
  )
  const currentTargetItem = useMemo(
    () => targetLanguageItems.find(item => item.value === language.targetCode) ?? null,
    [language.targetCode, targetLanguageItems],
  )

  const handleSourceLangChange = (item: LanguageItem | null) => {
    if (!item || item.value === language.sourceCode)
      return
    void setLanguage({ sourceCode: item.value })
  }

  const handleTargetLangChange = (item: LanguageItem | null) => {
    if (!item || item.value === "auto" || item.value === language.targetCode)
      return
    void setLanguage({ targetCode: item.value })
  }

  const sourceLangLabel
    = language.sourceCode === "auto"
      ? `${currentSourceItem?.label ?? getLanguageLabel(detectedCode)} (auto)`
      : currentSourceItem?.label ?? getLanguageLabel(language.sourceCode)

  const targetLangLabel = currentTargetItem?.label ?? getLanguageLabel(language.targetCode)

  const handleSwapLanguages = () => {
    const nextSourceCode = language.targetCode
    const nextTargetCode = language.sourceCode === "auto" ? detectedCode : language.sourceCode
    if (nextSourceCode === nextTargetCode)
      return
    void setLanguage({ sourceCode: nextSourceCode, targetCode: nextTargetCode })
  }

  return (
    <div className="flex items-center gap-2">
      <Combobox
        value={currentSourceItem}
        onValueChange={handleSourceLangChange}
        items={sourceLanguageItems}
        filter={filterLanguage}
        autoHighlight
      >
        <LanguageComboboxTrigger
          label={sourceLangLabel}
          subtitle={language.sourceCode === "auto"
            ? i18n.t("popup.autoLang")
            : i18n.t("popup.sourceLang")}
          ariaLabel={i18n.t("popup.sourceLang")}
        />
        <ComboboxContent className="rounded-lg shadow-md w-72">
          <ComboboxInput
            showTrigger={false}
            placeholder={i18n.t("languageCombobox.searchLanguages")}
          />
          <ComboboxList>
            {(item: LanguageItem) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
                {item.value === "auto" && <AutoLangCell />}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>{i18n.t("languageCombobox.noLanguagesFound")}</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
      <button
        type="button"
        onClick={handleSwapLanguages}
        aria-label={i18n.t("popup.translate")}
        className="group flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground shadow-sm transition-all duration-300 hover:rotate-180 hover:border-brand/50 hover:text-brand active:scale-90"
      >
        <Icon icon="tabler:arrows-exchange" className="size-4" />
      </button>
      <Combobox
        value={currentTargetItem}
        onValueChange={handleTargetLangChange}
        items={targetLanguageItems}
        filter={filterLanguage}
        autoHighlight
      >
        <LanguageComboboxTrigger
          label={targetLangLabel}
          subtitle={i18n.t("popup.targetLang")}
          ariaLabel={i18n.t("popup.targetLang")}
        />
        <ComboboxContent className="rounded-lg shadow-md w-72">
          <ComboboxInput
            showTrigger={false}
            placeholder={i18n.t("languageCombobox.searchLanguages")}
          />
          <ComboboxList>
            {(item: LanguageItem<LangCodeISO6393>) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>{i18n.t("languageCombobox.noLanguagesFound")}</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

function AutoLangCell() {
  return <span className="rounded-full bg-muted px-1 text-xs text-muted-foreground flex items-center">auto</span>
}
