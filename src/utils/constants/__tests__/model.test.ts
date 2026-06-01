import { describe, expect, it } from "vitest"
import { getProviderOptions } from "../../providers/options"
import { LLM_PROVIDER_MODELS } from "../models"

describe("provider model options", () => {
  it("keeps only TransLite V1 LLM providers", () => {
    expect(Object.keys(LLM_PROVIDER_MODELS)).toEqual([
      "openai-compatible",
      "deepseek",
      "google",
      "openrouter",
      "ollama",
    ])
  })

  it("returns options for Gemini models", () => {
    expect(getProviderOptions("gemini-2.5-pro", "google")?.google?.thinkingConfig)
      .toMatchObject({ thinkingBudget: 0, includeThoughts: false })
    expect(getProviderOptions("gemini-3.1-flash-lite", "google")?.google?.thinkingConfig)
      .toMatchObject({ thinkingLevel: "minimal", includeThoughts: false })
  })

  it("returns options for DeepSeek reasoning models", () => {
    expect(getProviderOptions("deepseek-reasoner", "deepseek")?.deepseek?.thinking)
      .toEqual({ type: "disabled" })
    expect(getProviderOptions("deepseek-v4-flash", "deepseek")?.deepseek?.thinking)
      .toEqual({ type: "disabled" })
  })

  it("returns generic reasoning options for OpenAI-compatible model names", () => {
    expect(getProviderOptions("gpt-5-mini", "openai-compatible")?.["openai-compatible"]?.reasoningEffort)
      .toBe("minimal")
    expect(getProviderOptions("openai/gpt-oss-120b", "openrouter")?.openrouter?.reasoningEffort)
      .toBe("none")
  })

  it("returns undefined for non-matching models", () => {
    expect(getProviderOptions("some-random-model", "openai-compatible")).toBeUndefined()
  })
})
