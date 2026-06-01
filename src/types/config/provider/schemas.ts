import type {
  APIProviderTypes,
  CustomLLMProviderTypes,
  LLMProviderTypes,
  NonAPIProviderTypes,
  NonCustomLLMProviderTypes,
  PureAPIProviderTypes,
  TranslateProviderTypes,
} from "./constants"

import { z } from "zod"

import { LLM_PROVIDER_MODELS } from "./constants"

function createProviderModelSchema<T extends LLMProviderTypes>(provider: T) {
  const models = LLM_PROVIDER_MODELS[provider]
  return z.object({
    model: z.enum(models),
    isCustomModel: provider === "openai-compatible" ? z.literal(true) : z.boolean(),
    customModel: z.string().nullable(),
  })
}

export const baseProviderConfigSchema = z.strictObject({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  enabled: z.boolean(),
})

export const baseAPIProviderConfigSchema = baseProviderConfigSchema.extend({
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  temperature: z.number().min(0).optional(),
})

export const baseCustomLLMProviderConfigSchema = baseAPIProviderConfigSchema.extend({
  baseURL: z.string(),
})

const llmProviderConfigSchemaList = [
  baseCustomLLMProviderConfigSchema.extend({
    provider: z.literal("openai-compatible"),
    model: createProviderModelSchema<"openai-compatible">("openai-compatible"),
  }),
  baseAPIProviderConfigSchema.extend({
    provider: z.literal("deepseek"),
    model: createProviderModelSchema<"deepseek">("deepseek"),
  }),
  baseAPIProviderConfigSchema.extend({
    provider: z.literal("google"),
    model: createProviderModelSchema<"google">("google"),
  }),
  baseAPIProviderConfigSchema.extend({
    provider: z.literal("openrouter"),
    model: createProviderModelSchema<"openrouter">("openrouter"),
  }),
  baseAPIProviderConfigSchema.extend({
    provider: z.literal("ollama"),
    model: createProviderModelSchema<"ollama">("ollama"),
  }),
] as const

const apiProviderConfigSchemaList = [
  ...llmProviderConfigSchemaList,
  baseAPIProviderConfigSchema.extend({
    provider: z.literal("deepl"),
  }),
] as const

export const providerConfigSchemaList = [
  ...apiProviderConfigSchemaList,
  baseProviderConfigSchema.extend({
    provider: z.literal("google-translate"),
  }),
  baseProviderConfigSchema.extend({
    provider: z.literal("microsoft-translate"),
  }),
] as const

export const llmProviderConfigItemSchema = z.discriminatedUnion("provider", llmProviderConfigSchemaList)
export const apiProviderConfigItemSchema = z.discriminatedUnion("provider", apiProviderConfigSchemaList)
export const providerConfigItemSchema = z.discriminatedUnion("provider", providerConfigSchemaList)

export const providersConfigSchema = z.array(providerConfigItemSchema).superRefine(
  (providers, ctx) => {
    const idSet = new Set<string>()
    providers.forEach((provider, index) => {
      if (idSet.has(provider.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate provider id "${provider.id}"`,
          path: [index, "id"],
        })
      }
      idSet.add(provider.id)
    })

    const nameSet = new Set<string>()
    providers.forEach((provider, index) => {
      if (nameSet.has(provider.name)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate provider name "${provider.name}"`,
          path: [index, "name"],
        })
      }
      nameSet.add(provider.name)
    })
  },
)
export type ProvidersConfig = z.infer<typeof providersConfigSchema>
export type ProviderConfig = ProvidersConfig[number]
export type NonAPIProviderConfig = Extract<ProviderConfig, { provider: NonAPIProviderTypes }>
export type PureProviderConfig = Extract<ProviderConfig, { provider: PureAPIProviderTypes }>
export type APIProviderConfig = Extract<ProviderConfig, { provider: APIProviderTypes }>
export type PureAPIProviderConfig = Extract<ProviderConfig, { provider: PureAPIProviderTypes }>
export type LLMProviderConfig = Extract<ProviderConfig, { provider: LLMProviderTypes }>
export type TranslateProviderConfig = Extract<ProviderConfig, { provider: TranslateProviderTypes }>
export type NonCustomLLMProviderConfig = Extract<ProviderConfig, { provider: NonCustomLLMProviderTypes }>
export type CustomLLMProviderConfig = Extract<ProviderConfig, { provider: CustomLLMProviderTypes }>

type ModelTuple = readonly [string, ...string[]]
function providerConfigSchema<T extends ModelTuple>(models: T) {
  return z.object({
    model: z.enum(models),
    isCustomModel: z.boolean(),
    customModel: z.string().nullable(),
  })
}

type SchemaShape<M extends Record<string, ModelTuple>> = { [K in keyof M]: ReturnType<typeof providerConfigSchema<M[K]>> }

function buildProviderModelsSchema<M extends Record<string, ModelTuple>>(models: M) {
  return z.object(
    (Object.keys(models) as (keyof M)[]).reduce((acc, key) => {
      acc[key] = providerConfigSchema(models[key])
      return acc
    }, {} as SchemaShape<M>),
  )
}

const { "openai-compatible": _, ollama: _ollama, ...standardModels } = LLM_PROVIDER_MODELS
export const llmProviderModelsSchema = buildProviderModelsSchema(standardModels).extend({
  "openai-compatible": z.object({
    model: z.enum(LLM_PROVIDER_MODELS["openai-compatible"]),
    isCustomModel: z.literal(true),
    customModel: z.string().nullable(),
  }),
  "ollama": z.object({
    model: z.enum(LLM_PROVIDER_MODELS.ollama),
    isCustomModel: z.boolean(),
    customModel: z.string().nullable(),
  }),
})
export type LLMProviderModels = z.infer<typeof llmProviderModelsSchema>
