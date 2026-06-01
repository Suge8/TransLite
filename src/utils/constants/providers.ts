import type { AllProviderTypes, APIProviderTypes, LLMProviderModels, ProviderConfig, ProvidersConfig } from "@/types/config/provider"
import type { Theme } from "@/types/config/theme"
import { i18n } from "#imports"
import customProviderLogo from "@/assets/providers/custom-provider.svg?url&no-inline"
import deeplLogoDark from "@/assets/providers/deepl-dark.svg?url&no-inline"
import deeplLogoLight from "@/assets/providers/deepl-light.svg?url&no-inline"
import { env } from "@/env"
import { API_PROVIDER_TYPES, CUSTOM_LLM_PROVIDER_TYPES, NON_API_TRANSLATE_PROVIDERS, NON_API_TRANSLATE_PROVIDERS_MAP, NON_CUSTOM_LLM_PROVIDER_TYPES, PURE_API_PROVIDER_TYPES, PURE_TRANSLATE_PROVIDERS, TRANSLATE_PROVIDER_TYPES } from "@/types/config/provider"
import { omit, pick } from "@/types/utils"
import { getLobeIconsCDNUrlFn } from "../logo"

export const DEFAULT_LLM_PROVIDER_MODELS: LLMProviderModels = {
  "openai-compatible": {
    model: "use-custom-model",
    isCustomModel: true,
    customModel: null,
  },
  "deepseek": {
    model: "deepseek-v4-flash",
    isCustomModel: false,
    customModel: null,
  },
  "google": {
    model: "gemini-3.1-flash-lite",
    isCustomModel: false,
    customModel: null,
  },
  "openrouter": {
    model: "x-ai/grok-4-fast:free",
    isCustomModel: false,
    customModel: null,
  },
  "ollama": {
    model: "gemma3:4b",
    isCustomModel: false,
    customModel: null,
  },
}

export const PROVIDER_ITEMS: Record<AllProviderTypes, { logo: (theme: Theme) => string, name: string, website: string }> = {
  "microsoft-translate": {
    logo: getLobeIconsCDNUrlFn("microsoft-color"),
    name: NON_API_TRANSLATE_PROVIDERS_MAP["microsoft-translate"],
    website: "https://translator.microsoft.com",
  },
  "google-translate": {
    logo: getLobeIconsCDNUrlFn("google-color"),
    name: NON_API_TRANSLATE_PROVIDERS_MAP["google-translate"],
    website: "https://translate.google.com",
  },
  "deepl": {
    logo: (theme: Theme) => theme === "light" ? deeplLogoLight : deeplLogoDark,
    name: "DeepL",
    website: "https://www.deepl.com/pro-api",
  },
  "openai-compatible": {
    logo: () => customProviderLogo,
    name: "Custom Provider",
    website: `${env.WXT_WEBSITE_URL}/docs/providers/openai-compatible-providers`,
  },
  "deepseek": {
    logo: getLobeIconsCDNUrlFn("deepseek-color"),
    name: "DeepSeek",
    website: "https://platform.deepseek.com",
  },
  "google": {
    logo: getLobeIconsCDNUrlFn("gemini-color"),
    name: "Gemini",
    website: "https://aistudio.google.com",
  },
  "openrouter": {
    logo: getLobeIconsCDNUrlFn("openrouter"),
    name: "OpenRouter",
    website: "https://openrouter.ai/",
  },
  "ollama": {
    logo: getLobeIconsCDNUrlFn("ollama"),
    name: "Ollama",
    website: "https://ollama.ai",
  },
}

export const DEFAULT_PROVIDER_CONFIG = {
  "google-translate": {
    id: "google-translate-default",
    name: PROVIDER_ITEMS["google-translate"].name,
    enabled: true,
    provider: "google-translate",
  },
  "microsoft-translate": {
    id: "microsoft-translate-default",
    name: PROVIDER_ITEMS["microsoft-translate"].name,
    enabled: true,
    provider: "microsoft-translate",
  },
  "deepl": {
    id: "deepl-default",
    name: PROVIDER_ITEMS.deepl.name,
    description: i18n.t("options.apiProviders.providers.description.deepl"),
    enabled: false,
    provider: "deepl",
  },
  "openai-compatible": {
    id: "openai-compatible-default",
    name: PROVIDER_ITEMS["openai-compatible"].name,
    description: i18n.t("options.apiProviders.providers.description.openaiCompatible"),
    enabled: false,
    provider: "openai-compatible",
    baseURL: "https://api.example.com/v1",
    model: DEFAULT_LLM_PROVIDER_MODELS["openai-compatible"],
  },
  "deepseek": {
    id: "deepseek-default",
    name: PROVIDER_ITEMS.deepseek.name,
    description: i18n.t("options.apiProviders.providers.description.deepseek"),
    enabled: false,
    provider: "deepseek",
    model: DEFAULT_LLM_PROVIDER_MODELS.deepseek,
  },
  "google": {
    id: "google-default",
    name: PROVIDER_ITEMS.google.name,
    description: i18n.t("options.apiProviders.providers.description.google"),
    enabled: false,
    provider: "google",
    model: DEFAULT_LLM_PROVIDER_MODELS.google,
  },
  "openrouter": {
    id: "openrouter-default",
    name: PROVIDER_ITEMS.openrouter.name,
    description: i18n.t("options.apiProviders.providers.description.openrouter"),
    enabled: false,
    provider: "openrouter",
    model: DEFAULT_LLM_PROVIDER_MODELS.openrouter,
  },
  "ollama": {
    id: "ollama-default",
    name: PROVIDER_ITEMS.ollama.name,
    description: i18n.t("options.apiProviders.providers.description.ollama"),
    enabled: false,
    provider: "ollama",
    baseURL: "http://127.0.0.1:11434/api",
    model: DEFAULT_LLM_PROVIDER_MODELS.ollama,
  },
} as const satisfies Record<AllProviderTypes, ProviderConfig>

export const DEFAULT_PROVIDER_CONFIG_LIST: ProvidersConfig = [
  DEFAULT_PROVIDER_CONFIG["microsoft-translate"],
  DEFAULT_PROVIDER_CONFIG["google-translate"],
  DEFAULT_PROVIDER_CONFIG.deepl,
  DEFAULT_PROVIDER_CONFIG["openai-compatible"],
  DEFAULT_PROVIDER_CONFIG.deepseek,
  DEFAULT_PROVIDER_CONFIG.google,
  DEFAULT_PROVIDER_CONFIG.openrouter,
  DEFAULT_PROVIDER_CONFIG.ollama,
]

export const NON_API_TRANSLATE_PROVIDER_ITEMS = pick(
  PROVIDER_ITEMS,
  NON_API_TRANSLATE_PROVIDERS,
)

export const TRANSLATE_PROVIDER_ITEMS = pick(
  PROVIDER_ITEMS,
  TRANSLATE_PROVIDER_TYPES,
)

export const PURE_TRANSLATE_PROVIDER_ITEMS = pick(
  TRANSLATE_PROVIDER_ITEMS,
  PURE_TRANSLATE_PROVIDERS,
)

export const LLM_PROVIDER_ITEMS = omit(
  TRANSLATE_PROVIDER_ITEMS,
  PURE_TRANSLATE_PROVIDERS,
)

export const API_PROVIDER_ITEMS = pick(
  PROVIDER_ITEMS,
  API_PROVIDER_TYPES,
)

export const PROVIDER_GROUPS = {
  builtInProviders: {
    types: NON_CUSTOM_LLM_PROVIDER_TYPES,
    tutorialSlug: "built-in-providers",
  },
  openaiCompatibleProviders: {
    types: CUSTOM_LLM_PROVIDER_TYPES,
    tutorialSlug: "openai-compatible-providers",
  },
  pureTranslationProviders: {
    types: PURE_API_PROVIDER_TYPES,
    tutorialSlug: "pure-translation-providers",
  },
} as const satisfies Record<string, { types: readonly APIProviderTypes[], tutorialSlug: string }>

export const SPECIFIC_TUTORIAL_PROVIDER_TYPES = ["ollama", "deepl"] as const satisfies readonly APIProviderTypes[]
