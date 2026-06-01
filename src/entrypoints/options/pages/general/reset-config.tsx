import { IconRefresh } from "@tabler/icons-react"
import { useSetAtom } from "jotai"
import { useState } from "react"
import { i18n } from "#imports"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/base-ui/alert-dialog"
import { Button } from "@/components/ui/base-ui/button"
import { writeConfigAtom } from "@/utils/atoms/config"
import { DEFAULT_CONFIG } from "@/utils/constants/config"
import { ConfigCard } from "../../components/config-card"

export function ResetConfig() {
  const [open, setOpen] = useState(false)
  const setConfig = useSetAtom(writeConfigAtom)

  const resetConfig = async () => {
    await setConfig(DEFAULT_CONFIG)
    setOpen(false)
  }

  return (
    <ConfigCard
      id="reset-config"
      inline
      title={i18n.t("options.general.resetConfig.title")}
    >
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger render={<Button variant="destructive" />}>
          <IconRefresh className="size-4" />
          {i18n.t("options.general.resetConfig.dialog.trigger")}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{i18n.t("options.general.resetConfig.dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {i18n.t("options.general.resetConfig.dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n.t("options.general.resetConfig.dialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={resetConfig}>
              {i18n.t("options.general.resetConfig.dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfigCard>
  )
}
