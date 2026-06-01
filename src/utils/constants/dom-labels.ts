export const CONTENT_WRAPPER_CLASS = "tl-translated-content-wrapper"
export const INLINE_CONTENT_CLASS = "tl-translated-inline-content"
export const BLOCK_CONTENT_CLASS = "tl-translated-block-content"
export const FLOAT_WRAP_ATTRIBUTE = "data-tl-float-wrap"

export const WALKED_ATTRIBUTE = "data-tl-walked"
// paragraph means you need to trigger translation on this element (i.e. we have inline children in it)
export const PARAGRAPH_ATTRIBUTE = "data-tl-paragraph"
export const BLOCK_ATTRIBUTE = "data-tl-block-node"
export const INLINE_ATTRIBUTE = "data-tl-inline-node"

export const TRANSLATION_MODE_ATTRIBUTE = "data-tl-translation-mode"

export const MARK_ATTRIBUTES = new Set([WALKED_ATTRIBUTE, PARAGRAPH_ATTRIBUTE, BLOCK_ATTRIBUTE, INLINE_ATTRIBUTE])

export const NOTRANSLATE_CLASS = "notranslate"

export const REACT_SHADOW_HOST_CLASS = "tl-react-shadow-host"

export const TRANSLATION_ERROR_CONTAINER_CLASS = "tl-translation-error-container"
