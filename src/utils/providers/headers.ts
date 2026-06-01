import type { LLMProviderTypes } from "@/types/config/provider"
import { env } from "@/env"
import { APP_NAME } from "@/utils/constants/app"

export const DEFAULT_PROVIDER_HEADERS: Partial<Record<LLMProviderTypes, Record<string, string>>> = {
  openrouter: {
    "HTTP-Referer": env.WXT_WEBSITE_URL,
    "X-OpenRouter-Title": APP_NAME,
  },
}

export function getDefaultProviderHeaders(provider: LLMProviderTypes): Record<string, string> | undefined {
  return DEFAULT_PROVIDER_HEADERS[provider]
}
