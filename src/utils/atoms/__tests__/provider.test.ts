import type { PartialDeep } from "type-fest"
import type { ProviderConfig } from "@/types/config/provider"
import { describe, expect, it } from "vitest"
import { DEFAULT_PROVIDER_CONFIG } from "@/utils/constants/providers"
import { updateLLMProviderConfig, updateProviderConfig } from "../provider"

describe("provider config updates", () => {
  it("merges nested LLM model updates without changing untouched fields", () => {
    const result = updateLLMProviderConfig(DEFAULT_PROVIDER_CONFIG.deepseek, {
      model: {
        customModel: "deepseek-custom",
        isCustomModel: true,
      },
    })

    expect(result.model).toEqual({
      ...DEFAULT_PROVIDER_CONFIG.deepseek.model,
      customModel: "deepseek-custom",
      isCustomModel: true,
    })
    expect(result.provider).toBe("deepseek")
  })

  it("rejects merged configs that no longer match the provider schema", () => {
    const invalidUpdates = {
      provider: "deepseek",
    } as PartialDeep<ProviderConfig>

    expect(() => updateProviderConfig(DEFAULT_PROVIDER_CONFIG["google-translate"], invalidUpdates)).toThrow()
  })
})
