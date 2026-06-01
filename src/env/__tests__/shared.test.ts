import { describe, expect, it } from "vitest"
import { z } from "zod"
import {
  createExtensionClientEnvSchema,
  EXTENSION_ENV_DEFAULTS,
  resolveExtensionEnv,
} from "../shared"

function parseResolvedExtensionEnv(rawEnv: Record<string, string | boolean | undefined>) {
  return z.object(createExtensionClientEnvSchema(false, false)).parse(resolveExtensionEnv(rawEnv))
}

describe("extension env resolution", () => {
  it("uses defaults", () => {
    expect(resolveExtensionEnv({})).toEqual(EXTENSION_ENV_DEFAULTS)
  })

  it("lets explicit env vars override defaults", () => {
    expect(resolveExtensionEnv({ WXT_WEBSITE_URL: "https://docs.example.com" })).toMatchObject({
      WXT_WEBSITE_URL: "https://docs.example.com",
    })
  })

  it("passes through unrelated env vars untouched", () => {
    expect(resolveExtensionEnv({ WXT_FOO: "bar" })).toMatchObject({
      ...EXTENSION_ENV_DEFAULTS,
      WXT_FOO: "bar",
    })
  })
})

describe("extension env parsing", () => {
  it("accepts canonical urls", () => {
    expect(parseResolvedExtensionEnv({ WXT_WEBSITE_URL: "https://translite.app" })).toEqual({
      WXT_WEBSITE_URL: "https://translite.app",
    })
  })

  it("rejects urls with trailing slashes", () => {
    expect(() => parseResolvedExtensionEnv({
      WXT_WEBSITE_URL: "https://translite.app/",
    })).toThrowError("must not end with a trailing slash")
  })

  it("rejects urls with leading or trailing spaces", () => {
    expect(() => parseResolvedExtensionEnv({
      WXT_WEBSITE_URL: " https://translite.app",
    })).toThrowError("must not include leading or trailing whitespace")
  })
})
