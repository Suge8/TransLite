import { z } from "zod"
import { LANG_CODE_ISO6391_OPTIONS } from "./iso6391"
import { LANG_CODE_ISO6393_OPTIONS } from "./iso6393"

export const langCodeISO6393Schema = z.enum(LANG_CODE_ISO6393_OPTIONS)

export const langCodeISO6391Schema = z.enum(LANG_CODE_ISO6391_OPTIONS)

export const langLevel = z.enum(["beginner", "intermediate", "advanced"])
export type LangLevel = z.infer<typeof langLevel>

// RTL (Right-to-Left) languages basically Arabic-based languages
