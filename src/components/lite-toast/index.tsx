import { kebabCase } from "case-anything"
import * as React from "react"
import { Toaster } from "sonner"

import { browser } from "#imports"
import liteIcon from "@/assets/icons/translite.png?url&no-inline"
import { APP_NAME } from "@/utils/constants/app"

const liteIconUrl = new URL(liteIcon, browser.runtime.getURL("/")).href

const liteIconElement = (
  <img
    src={liteIconUrl}
    alt="🐸"
    style={{
      maxWidth: "100%",
      height: "auto",
      minHeight: "20px",
      minWidth: "20px",
    }}
  />
)

function LiteToast({ position = "bottom-left", toastOptions, ...props }: React.ComponentProps<typeof Toaster>) {
  return (
    <Toaster
      {...props}
      position={position}
      richColors
      icons={{
        warning: liteIconElement,
        success: liteIconElement,
        error: liteIconElement,
        info: liteIconElement,
        loading: liteIconElement,
      }}
      toastOptions={{
        ...toastOptions,
        className: [`${kebabCase(APP_NAME)}-toaster`, toastOptions?.className].filter(Boolean).join(" "),
      }}
      className="z-[2147483647] notranslate"
    />
  )
}

export default LiteToast
