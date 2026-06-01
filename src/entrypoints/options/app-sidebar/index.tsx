import { i18n } from "#imports"
import transLiteLogo from "@/assets/icons/translite.png"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/base-ui/sidebar"
import { version } from "../../../../package.json"
import { SettingsNav } from "./settings-nav"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="group-data-[state=expanded]:px-5 group-data-[state=expanded]:pt-4 transition-all">
        <div className="flex items-center gap-2">
          <div className="size-8 shrink-0 overflow-hidden rounded-lg">
            <img src={transLiteLogo} alt="Logo" className="size-full object-cover" />
          </div>
          <span className="text-md font-bold overflow-hidden truncate">{i18n.t("name")}</span>
          <span className="text-xs text-muted-foreground overflow-hidden truncate">
            {`v${version}`}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="group-data-[state=expanded]:px-2 transition-all">
        <SettingsNav />
      </SidebarContent>
    </Sidebar>
  )
}
