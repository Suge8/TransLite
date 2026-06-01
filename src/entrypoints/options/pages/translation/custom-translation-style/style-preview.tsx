import { useAtomValue } from "jotai"
import { useEffect, useRef } from "react"
import { i18n } from "#imports"
import { Field, FieldLabel } from "@/components/ui/base-ui/field"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { BLOCK_CONTENT_CLASS, CONTENT_WRAPPER_CLASS } from "@/utils/constants/dom-labels"
import { decorateTranslationNode } from "@/utils/host/translate/ui/decorate-translation"

const PREVIEW_TEXT = "神谷先生不是在对抗世界，而是在对抗可能让世界为之侧目的事物。"

export function StylePreview() {
  const { translationNodeStyle } = useAtomValue(configFieldsAtomMap.translate)
  const blockContentRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (blockContentRef.current) {
      void decorateTranslationNode(blockContentRef.current, translationNodeStyle)
    }
  }, [translationNodeStyle])

  return (
    <Field>
      <FieldLabel>
        {i18n.t("options.translation.translationStyle.preview")}
      </FieldLabel>
      <div id="style-preview" className="w-full flex flex-col gap-2 p-4 border rounded-md">
        <span className={CONTENT_WRAPPER_CLASS} lang="zh" dir="ltr">
          <span className={`text-sm ${BLOCK_CONTENT_CLASS}`} ref={blockContentRef}>
            {PREVIEW_TEXT}
          </span>
        </span>
      </div>
    </Field>
  )
}
