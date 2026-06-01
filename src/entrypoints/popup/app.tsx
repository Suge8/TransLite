import { Icon } from "@iconify/react"
import { i18n } from "#imports"
import transLiteLogo from "@/assets/icons/translite.png"
import { openOptionsPage } from "@/utils/navigation"
import { version } from "../../../package.json"
import { AlwaysTranslate } from "./components/always-translate"
import { AutoTranslateLanguagesField } from "./components/auto-translate-languages-field"
import LanguageOptionsSelector from "./components/language-options-selector"
import { PageTranslationShortcutField } from "./components/page-translation-shortcut-field"
import { SiteControlToggle } from "./components/site-control-toggle"
import TranslateButton from "./components/translate-button"
import TranslateProviderField from "./components/translate-provider-field"
import TranslationModeSelector from "./components/translation-mode-selector"

const RISE = "animate-[lt-rise_0.45s_ease-out_both]"

function App() {
  return (
    <div className="relative flex w-full flex-col overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-16 size-52 rounded-full bg-gradient-to-br from-brand-from via-brand-via to-brand-to opacity-25 blur-3xl animate-[lt-aurora_12s_ease-in-out_infinite] dark:opacity-30" />
        <div className="absolute top-28 -left-24 size-44 rounded-full bg-gradient-to-tr from-brand-to via-brand-via to-brand-from opacity-15 blur-3xl animate-[lt-aurora_18s_ease-in-out_infinite] dark:opacity-20" />
      </div>

      <div className="relative flex flex-col">
        <header className={`flex items-center gap-2.5 px-5 pt-5 pb-3.5 ${RISE}`}>
          <div className="size-9 shrink-0 overflow-hidden rounded-xl">
            <img src={transLiteLogo} alt="" className="size-full object-cover" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">{i18n.t("name")}</span>
            <span className="truncate text-[11px] text-muted-foreground">{i18n.t("popup.tagline")}</span>
          </div>
        </header>

        <div className="flex flex-col gap-3.5 px-5 pb-4">
          <div className={RISE} style={{ animationDelay: "60ms" }}>
            <LanguageOptionsSelector />
          </div>

          <div
            className={`flex flex-col divide-y divide-border/50 rounded-2xl border border-border/60 bg-card/55 backdrop-blur-sm ${RISE}`}
            style={{ animationDelay: "120ms" }}
          >
            <div className="px-3.5 py-2.5"><TranslationModeSelector /></div>
            <div className="px-3.5 py-2.5"><TranslateProviderField /></div>
            <div className="px-3.5 py-2.5"><AutoTranslateLanguagesField /></div>
            <div className="px-3.5 py-2.5"><PageTranslationShortcutField /></div>
          </div>

          <div className={RISE} style={{ animationDelay: "180ms" }}>
            <TranslateButton />
          </div>

          <div
            className={`flex flex-col gap-2.5 rounded-2xl border border-border/60 bg-card/55 p-3.5 backdrop-blur-sm ${RISE}`}
            style={{ animationDelay: "240ms" }}
          >
            <SiteControlToggle />
            <AlwaysTranslate />
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-border/50 px-3 py-1.5">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => {
              void openOptionsPage()
            }}
          >
            <Icon icon="tabler:settings" className="size-4" strokeWidth={1.6} />
            <span className="text-[13px] font-medium">{i18n.t("popup.options")}</span>
          </button>
          <span className="font-mono text-[11px] text-muted-foreground/70">{`v${version}`}</span>
        </footer>
      </div>
    </div>
  )
}

export default App
