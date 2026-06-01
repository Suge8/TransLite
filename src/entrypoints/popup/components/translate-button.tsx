import { useAtom, useAtomValue } from "jotai"
import { browser, i18n } from "#imports"
import { Button } from "@/components/ui/base-ui/button"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { sendMessage } from "@/utils/message"
import { formatPageTranslationShortcut, isPageTranslationShortcutEmpty } from "@/utils/page-translation-shortcut"
import { cn } from "@/utils/styles/utils"
import { isPageTranslatedAtom } from "../atoms/auto-translate"
import { isIgnoreTabAtom } from "../atoms/ignore"
import { isCurrentSiteInBlacklistAtom, isCurrentSiteInWhitelistAtom } from "../atoms/site-control"

export default function TranslateButton({ className }: { className?: string }) {
  const [isPageTranslated, setIsPageTranslated] = useAtom(isPageTranslatedAtom)
  const isIgnoreTab = useAtomValue(isIgnoreTabAtom)
  const translateConfig = useAtomValue(configFieldsAtomMap.translate)
  const { mode } = useAtomValue(configFieldsAtomMap.siteControl)
  const isCurrentSiteInWhitelist = useAtomValue(isCurrentSiteInWhitelistAtom)
  const isCurrentSiteInBlacklist = useAtomValue(isCurrentSiteInBlacklistAtom)

  const toggleTranslation = async () => {
    const [currentTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })

    if (currentTab.id) {
      const nextEnabled = !isPageTranslated
      void sendMessage("tryToSetEnablePageTranslationByTabId", {
        tabId: currentTab.id,
        enabled: nextEnabled,
      })

      setIsPageTranslated(prev => !prev)
    }
  }

  const isSiteBlocked = mode === "whitelist" ? !isCurrentSiteInWhitelist : isCurrentSiteInBlacklist
  const isDisabled = isIgnoreTab || isSiteBlocked
  const formattedShortcut = formatPageTranslationShortcut(translateConfig.page.shortcut)
  const shortcutSuffix = isPageTranslationShortcutEmpty(translateConfig.page.shortcut) ? "" : ` (${formattedShortcut})`

  return (
    <Button
      onClick={toggleTranslation}
      disabled={isDisabled}
      className={cn(
        "relative h-10 w-full overflow-hidden rounded-xl border-0 text-[13px] font-semibold tracking-wide transition-all duration-300 active:translate-y-px disabled:opacity-100",
        isDisabled
          ? "bg-muted text-muted-foreground/70"
          : isPageTranslated
            ? "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border hover:bg-secondary/70"
            : "bg-[linear-gradient(180deg,oklch(0.645_0.205_287),oklch(0.53_0.215_286))] text-white ring-1 ring-inset ring-white/15 shadow-[0_8px_22px_-6px_oklch(0.55_0.22_288_/_0.6)] hover:brightness-[1.06] hover:shadow-[0_12px_28px_-6px_oklch(0.55_0.22_288_/_0.78)]",
        className,
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-1.5 truncate">
        {isPageTranslated
          ? i18n.t("popup.showOriginal")
          : `${i18n.t("popup.translate")}${shortcutSuffix}`}
      </span>
    </Button>
  )
}
