import type { Config } from "@/types/config/config"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { createOllama } from "ollama-ai-provider-v2"
import { storage } from "#imports"
import { isCustomLLMProvider } from "@/types/config/provider"
import { getLLMProvidersConfig, getProviderConfigById } from "../config/helpers"
import { CONFIG_STORAGE_KEY } from "../constants/config"
import { getDefaultProviderHeaders } from "./headers"
import { resolveModelId } from "./model-id"

const CREATE_AI_MAPPER = {
  "openai-compatible": createOpenAICompatible,
  "deepseek": createDeepSeek,
  "google": createGoogleGenerativeAI,
  "openrouter": createOpenRouter,
  "ollama": createOllama,
} as const

async function getLanguageModelById(providerId: string) {
  const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
  if (!config) {
    throw new Error("Config not found")
  }

  const llmProvidersConfig = getLLMProvidersConfig(config.providersConfig)
  const providerConfig = getProviderConfigById(llmProvidersConfig, providerId)
  if (!providerConfig) {
    throw new Error(`Provider ${providerId} not found`)
  }

  const headers = getDefaultProviderHeaders(providerConfig.provider)
  const provider = isCustomLLMProvider(providerConfig.provider)
    ? CREATE_AI_MAPPER[providerConfig.provider]({
        name: providerConfig.provider,
        baseURL: providerConfig.baseURL ?? "",
        supportsStructuredOutputs: true,
        ...(providerConfig.apiKey && { apiKey: providerConfig.apiKey }),
        ...(headers && { headers }),
      })
    : CREATE_AI_MAPPER[providerConfig.provider]({
        ...(providerConfig.baseURL && { baseURL: providerConfig.baseURL }),
        ...(providerConfig.apiKey && { apiKey: providerConfig.apiKey }),
        ...(headers && { headers }),
      })

  const modelId = resolveModelId(providerConfig.model)

  if (!modelId) {
    throw new Error("Model is undefined")
  }

  return provider.languageModel(modelId)
}

export async function getModelById(providerId: string) {
  return getLanguageModelById(providerId)
}
