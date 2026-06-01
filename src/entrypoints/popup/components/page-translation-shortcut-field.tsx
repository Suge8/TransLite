import { useAtom } from "jotai"
import { i18n } from "#imports"
import { ShortcutKeyRecorder } from "@/components/shortcut-key-recorder"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { DEFAULT_AUTO_TRANSLATE_SHORTCUT_KEY } from "@/utils/constants/translate"

export function PageTranslationShortcutField() {
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  const shortcut = translateConfig.page.shortcut ?? DEFAULT_AUTO_TRANSLATE_SHORTCUT_KEY

  const updateShortcut = (shortcut: string) => {
    void setTranslateConfig({
      ...translateConfig,
      page: {
        ...translateConfig.page,
        shortcut,
      },
    })
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium">
        {i18n.t("popup.pageTranslationShortcut")}
      </span>
      <ShortcutKeyRecorder
        shortcutKey={shortcut}
        onChange={updateShortcut}
        className="h-7! w-31 cursor-pointer px-2 text-center"
      />
    </div>
  )
}
