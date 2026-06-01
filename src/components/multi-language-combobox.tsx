import type { LanguageItem } from "./language-combobox-options"
import type { LangCodeISO6393 } from "@/utils/languages/definitions"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { Icon } from "@iconify/react"
import { useMemo } from "react"
import { i18n } from "#imports"
import { Button } from "@/components/ui/base-ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/base-ui/combobox"
import { getLanguageLabel } from "@/utils/language-labels"
import { langCodeISO6393Schema } from "@/utils/languages/definitions"
import { cn } from "@/utils/styles/utils"
import { filterLanguage } from "./language-combobox-options"

function getLanguageItems(): LanguageItem<LangCodeISO6393>[] {
  return langCodeISO6393Schema.options.map(code => ({
    value: code,
    label: getLanguageLabel(code),
  }))
}

interface MultiLanguageComboboxProps {
  selectedLanguages: LangCodeISO6393[]
  onLanguagesChange: (languages: LangCodeISO6393[]) => void
  buttonLabel: string
  className?: string
  clearLabel?: string
  contentAlign?: "start" | "center" | "end"
}

export function MultiLanguageCombobox({
  selectedLanguages,
  onLanguagesChange,
  buttonLabel,
  className,
  clearLabel,
  contentAlign = "end",
}: MultiLanguageComboboxProps) {
  const languageItems = useMemo(() => getLanguageItems(), [])

  const selectedItems = useMemo(
    () => languageItems.filter(item => selectedLanguages.includes(item.value)),
    [languageItems, selectedLanguages],
  )

  return (
    <Combobox
      multiple
      value={selectedItems}
      onValueChange={(items: LanguageItem<LangCodeISO6393>[]) => {
        onLanguagesChange(items.map(item => item.value))
      }}
      items={languageItems}
      filter={filterLanguage}
    >
      <ComboboxPrimitive.Trigger render={<Button variant="outline" className={cn("w-40 justify-between", className)} />}>
        <span className="truncate">{buttonLabel}</span>
        <Icon icon="tabler:chevron-down" className="text-muted-foreground" />
      </ComboboxPrimitive.Trigger>
      <ComboboxContent align={contentAlign} className="w-fit">
        <ComboboxInput showTrigger={false} placeholder={i18n.t("languageCombobox.searchLanguages")} />
        {clearLabel && selectedLanguages.length > 0 && (
          <>
            <button
              type="button"
              className="mx-1 mt-1 flex w-[calc(100%-0.5rem)] cursor-default items-center rounded-md px-1.5 py-1 text-sm text-muted-foreground outline-hidden hover:bg-accent hover:text-accent-foreground"
              onClick={() => onLanguagesChange([])}
            >
              {clearLabel}
            </button>
            <ComboboxSeparator />
          </>
        )}
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
  )
}
