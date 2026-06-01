import { beforeEach, describe, expect, it, vi } from "vitest"
import { storage } from "#imports"
import { DEFAULT_PROVIDER_HEADERS } from "../headers"

let getStorageItemMock: ReturnType<typeof vi.fn>

const {
  openRouterLanguageModelMock,
  openAICompatibleLanguageModelMock,
  createOpenRouterMock,
  createOpenAICompatibleMock,
} = vi.hoisted(() => {
  const openRouterLanguageModelMock = vi.fn()
  const openAICompatibleLanguageModelMock = vi.fn()
  const createOpenRouterMock = vi.fn((_options?: Record<string, unknown>) => ({
    languageModel: openRouterLanguageModelMock,
  }))
  const createOpenAICompatibleMock = vi.fn((_options?: Record<string, unknown>) => ({
    languageModel: openAICompatibleLanguageModelMock,
  }))

  return {
    openRouterLanguageModelMock,
    openAICompatibleLanguageModelMock,
    createOpenRouterMock,
    createOpenAICompatibleMock,
  }
})

vi.mock("@ai-sdk/deepseek", () => ({
  createDeepSeek: vi.fn(() => ({ languageModel: vi.fn() })),
}))

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => ({ languageModel: vi.fn() })),
}))

vi.mock("@openrouter/ai-sdk-provider", () => ({
  createOpenRouter: createOpenRouterMock,
}))

vi.mock("@ai-sdk/openai-compatible", () => ({
  createOpenAICompatible: createOpenAICompatibleMock,
}))

vi.mock("ollama-ai-provider-v2", () => ({
  createOllama: vi.fn(() => ({ languageModel: vi.fn() })),
}))

const openRouterProviderConfig = {
  id: "openrouter-default",
  name: "OpenRouter",
  enabled: true,
  provider: "openrouter",
  apiKey: "test-key",
  model: {
    model: "x-ai/grok-4-fast:free",
    isCustomModel: false,
    customModel: null,
  },
}

describe("getModelById", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    openRouterLanguageModelMock.mockReturnValue("openrouter-model")
    openAICompatibleLanguageModelMock.mockReturnValue("custom-model")
    getStorageItemMock = vi.fn()
    ;(storage.getItem as unknown as ReturnType<typeof vi.fn>) = getStorageItemMock
  })

  it("passes default attribution headers for OpenRouter", async () => {
    getStorageItemMock.mockResolvedValue({
      providersConfig: [openRouterProviderConfig],
    })

    const { getModelById } = await import("../model")
    const result = await getModelById("openrouter-default")

    expect(result).toBe("openrouter-model")
    expect(createOpenRouterMock).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: "test-key",
      headers: DEFAULT_PROVIDER_HEADERS.openrouter,
    }))
    expect(openRouterLanguageModelMock).toHaveBeenCalledWith("x-ai/grok-4-fast:free")
  })

  it("creates OpenAI-compatible providers without custom headers", async () => {
    getStorageItemMock.mockResolvedValue({
      providersConfig: [
        {
          id: "custom-openai",
          name: "Custom Provider",
          enabled: true,
          provider: "openai-compatible",
          apiKey: "custom-key",
          baseURL: "http://127.0.0.1:1234/v1",
          model: {
            model: "use-custom-model",
            isCustomModel: true,
            customModel: "huihui-hy-mt1.5-1.8b-abliterated",
          },
        },
      ],
    })

    const { getModelById } = await import("../model")
    const result = await getModelById("custom-openai")

    expect(result).toBe("custom-model")
    expect(createOpenAICompatibleMock).toHaveBeenCalledWith(expect.objectContaining({
      name: "openai-compatible",
      baseURL: "http://127.0.0.1:1234/v1",
      apiKey: "custom-key",
    }))
    expect(createOpenAICompatibleMock.mock.calls[0]?.[0]).not.toHaveProperty("headers")
    expect(openAICompatibleLanguageModelMock).toHaveBeenCalledWith("huihui-hy-mt1.5-1.8b-abliterated")
  })
})
