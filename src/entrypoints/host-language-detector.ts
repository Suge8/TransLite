import "@/utils/zod-config"
import { defineUnlistedScript } from "wxt/utils/define-unlisted-script"
import { detectPageLanguageLightweight } from "@/utils/content/page-language"
import { sendMessage } from "@/utils/message"

export default defineUnlistedScript(async () => {
  const { detectedCodeOrUnd } = await detectPageLanguageLightweight()
  await sendMessage("reportDetectedPageLanguage", {
    url: window.location.href,
    detectedCodeOrUnd,
  })
})
