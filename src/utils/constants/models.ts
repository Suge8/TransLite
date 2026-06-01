import type { JSONValue } from "ai"

export const LLM_PROVIDER_MODELS = {
  "openai-compatible": ["use-custom-model"],
  "deepseek": ["deepseek-v4-flash", "deepseek-v4-pro", "deepseek-chat", "deepseek-reasoner"],
  "google": ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite", "gemini-3-flash-preview", "gemini-3-pro-preview", "gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-flash-8b", "gemini-1.5-flash", "gemini-1.5-pro"],
  "openrouter": ["x-ai/grok-4-fast:free", "openai/gpt-4.1-mini"],
  "ollama": ["gemma3:4b", "llama3.2:3b"],
} as const

export const NON_API_TRANSLATE_PROVIDERS = ["google-translate", "microsoft-translate"] as const
export const NON_API_TRANSLATE_PROVIDERS_MAP: Record<typeof NON_API_TRANSLATE_PROVIDERS[number], string> = {
  "google-translate": "Google Translate",
  "microsoft-translate": "Microsoft Translator",
}

export const PURE_TRANSLATE_PROVIDERS = ["google-translate", "microsoft-translate", "deepl"] as const

export const LLM_MODEL_OPTIONS: Array<{
  pattern: RegExp
  options: Record<string, JSONValue>
}> = [
  {
    pattern: /^gemini-3(?:\.\d+)?-.*?(?:-preview(?:-customtools)?)?$/,
    options: { thinkingConfig: { thinkingLevel: "minimal", includeThoughts: false } },
  },
  {
    pattern: /^gemini-2\.5-/,
    options: { thinkingConfig: { thinkingBudget: 0, includeThoughts: false } },
  },
  {
    pattern: /^gemini-/,
    options: { thinkingConfig: { thinkingBudget: 0, includeThoughts: false } },
  },
  {
    pattern: /^deepseek-(?:reasoner|v4-(?:flash|pro))$/,
    options: { thinking: { type: "disabled" } },
  },
  {
    pattern: /^(?:openai\/)?gpt-oss-(?:20|120)b$/i,
    options: { reasoningEffort: "none" },
  },
  {
    pattern: /^(?:o1|o3|o4-mini)(?:-|$)/,
    options: { reasoningEffort: "minimal" },
  },
  {
    pattern: /^(?:gpt-5|gpt-5-mini|gpt-5-nano|gpt-5-codex)$/,
    options: { reasoningEffort: "minimal" },
  },
]
