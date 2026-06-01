import { Icon } from "@iconify/react"
import { Link, useLocation } from "react-router"
import { i18n } from "#imports"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/base-ui/sidebar"

const navItems = [
  { path: "/", icon: "tabler:adjustments-horizontal", labelKey: "options.general.title" },
  { path: "/translation", icon: "ri:translate", labelKey: "options.translation.title" },
  { path: "/video-subtitles", icon: "tabler:subtitles", labelKey: "options.videoSubtitles.title" },
  { path: "/api-providers", icon: "tabler:api", labelKey: "options.apiProviders.title" },
] as const

export function SettingsNav() {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{i18n.t("options.sidebar.settings")}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map(item => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                render={<Link to={item.path} />}
                isActive={pathname === item.path}
                className="transition-colors data-active:bg-brand/10 data-active:text-brand data-active:[&_svg]:text-brand dark:data-active:bg-brand/15"
              >
                <Icon icon={item.icon} />
                <span>{i18n.t(item.labelKey)}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
