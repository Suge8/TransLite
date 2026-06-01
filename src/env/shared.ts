import { z } from "zod"

export const EXTENSION_ENV_DEFAULTS = {
  WXT_WEBSITE_URL: "https://translite.app",
} as const

export type RawExtensionEnv = Record<string, string | boolean | undefined>

const strictStringSchema = z.string().refine(value => value === value.trim(), {
  message: "must not include leading or trailing whitespace",
})

const strictUrlSchema = strictStringSchema
  .pipe(z.url())
  .refine(value => !value.endsWith("/"), {
    message: "must not end with a trailing slash",
  })

export function resolveExtensionEnv(rawEnv: RawExtensionEnv) {
  return {
    ...rawEnv,
    WXT_WEBSITE_URL: rawEnv.WXT_WEBSITE_URL ?? EXTENSION_ENV_DEFAULTS.WXT_WEBSITE_URL,
  }
}

export function createExtensionClientEnvSchema(
  _isProd: boolean,
  _skipRequiredProductionEnv = false,
) {
  return {
    WXT_WEBSITE_URL: strictUrlSchema,
  } satisfies Record<string, z.ZodType>
}
