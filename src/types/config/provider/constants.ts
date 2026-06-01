import { LLM_PROVIDER_MODELS, NON_API_TRANSLATE_PROVIDERS, NON_API_TRANSLATE_PROVIDERS_MAP, PURE_TRANSLATE_PROVIDERS } from "@/utils/constants/models"

export { LLM_PROVIDER_MODELS, NON_API_TRANSLATE_PROVIDERS, NON_API_TRANSLATE_PROVIDERS_MAP, PURE_TRANSLATE_PROVIDERS }

export const TRANSLATE_PROVIDER_TYPES = [
  "google-translate",
  "microsoft-translate",
  "deepl",
  "openai-compatible",
  "deepseek",
  "google",
  "openrouter",
  "ollama",
] as const satisfies Readonly<
  (keyof typeof LLM_PROVIDER_MODELS | typeof PURE_TRANSLATE_PROVIDERS[number])[]
>
export type TranslateProviderTypes = typeof TRANSLATE_PROVIDER_TYPES[number]
export function isTranslateProvider(provider: string): provider is TranslateProviderTypes {
  return TRANSLATE_PROVIDER_TYPES.includes(provider)
}

export const LLM_PROVIDER_TYPES = [
  "openai-compatible",
  "deepseek",
  "google",
  "openrouter",
  "ollama",
] as const satisfies Readonly<(keyof typeof LLM_PROVIDER_MODELS)[]>
export type LLMProviderTypes = typeof LLM_PROVIDER_TYPES[number]
export function isLLMProvider(provider: string): provider is LLMProviderTypes {
  return LLM_PROVIDER_TYPES.includes(provider)
}

export const CUSTOM_LLM_PROVIDER_TYPES = ["openai-compatible"] as const satisfies Readonly<
  (keyof typeof LLM_PROVIDER_MODELS)[]
>
export type CustomLLMProviderTypes = typeof CUSTOM_LLM_PROVIDER_TYPES[number]
export function isCustomLLMProvider(provider: string): provider is CustomLLMProviderTypes {
  return CUSTOM_LLM_PROVIDER_TYPES.includes(provider)
}

export const NON_CUSTOM_LLM_PROVIDER_TYPES = ["deepseek", "google", "openrouter", "ollama"] as const satisfies Readonly<
  Exclude<keyof typeof LLM_PROVIDER_MODELS, CustomLLMProviderTypes>[]
>
export type NonCustomLLMProviderTypes = typeof NON_CUSTOM_LLM_PROVIDER_TYPES[number]
export function isNonCustomLLMProvider(provider: string): provider is NonCustomLLMProviderTypes {
  return NON_CUSTOM_LLM_PROVIDER_TYPES.includes(provider)
}

export const API_PROVIDER_TYPES = [
  "openai-compatible",
  "deepseek",
  "google",
  "deepl",
  "openrouter",
  "ollama",
] as const satisfies Readonly<(keyof typeof LLM_PROVIDER_MODELS | "deepl")[]>
export type APIProviderTypes = typeof API_PROVIDER_TYPES[number]
export function isAPIProvider(provider: string): provider is APIProviderTypes {
  return API_PROVIDER_TYPES.includes(provider)
}

export const PURE_API_PROVIDER_TYPES = ["deepl"] as const satisfies Readonly<
  Exclude<APIProviderTypes, LLMProviderTypes>[]
>
export type PureAPIProviderTypes = typeof PURE_API_PROVIDER_TYPES[number]
export function isPureAPIProvider(provider: string): provider is PureAPIProviderTypes {
  return PURE_API_PROVIDER_TYPES.includes(provider)
}

export type NonAPIProviderTypes = typeof NON_API_TRANSLATE_PROVIDERS[number]
export function isNonAPIProvider(provider: string): provider is NonAPIProviderTypes {
  return NON_API_TRANSLATE_PROVIDERS.includes(provider)
}

export const ALL_PROVIDER_TYPES = [
  "google-translate",
  "microsoft-translate",
  "deepl",
  "openai-compatible",
  "deepseek",
  "google",
  "openrouter",
  "ollama",
] as const satisfies Readonly<TranslateProviderTypes[]>
export type AllProviderTypes = typeof ALL_PROVIDER_TYPES[number]

export function isPureTranslateProvider(provider: TranslateProviderTypes): provider is typeof PURE_TRANSLATE_PROVIDERS[number] {
  return PURE_TRANSLATE_PROVIDERS.includes(provider)
}
