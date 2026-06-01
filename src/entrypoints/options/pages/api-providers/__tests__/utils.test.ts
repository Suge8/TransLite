import type { Config } from "@/types/config/config"
import type { APIProviderConfig } from "@/types/config/provider"
import { describe, expect, it, vi } from "vitest"
import { duplicateProvider } from "../utils"

type DeepSeekProviderConfig = Extract<APIProviderConfig, { provider: "deepseek" }>

describe("api provider utils", () => {
  it("duplicates an existing provider config with a fresh id and unique name", async () => {
    const sourceProvider: DeepSeekProviderConfig = {
      id: "deepseek-original",
      name: "DeepSeek",
      description: "shared credentials",
      enabled: true,
      provider: "deepseek",
      apiKey: "[REDACTED]",
      baseURL: "https://api.deepseek.com/v1",
      temperature: 0.3,
      model: {
        model: "deepseek-v4-flash",
        isCustomModel: true,
        customModel: "deepseek-v4-flash",
      },
    }
    const existingCopy: DeepSeekProviderConfig = {
      ...sourceProvider,
      id: "deepseek-copy",
      name: "DeepSeek 1",
    }
    const providersConfig = [sourceProvider, existingCopy] as Config["providersConfig"]
    let updatedProviders: Config["providersConfig"] | undefined
    const setProvidersConfig = vi.fn(async (config: Partial<Config["providersConfig"]>) => {
      updatedProviders = config as Config["providersConfig"]
    })
    const setSelectedProviderId = vi.fn()

    const newProviderId = await duplicateProvider(
      sourceProvider,
      providersConfig,
      setProvidersConfig,
      setSelectedProviderId,
    )

    expect(newProviderId).not.toBe(sourceProvider.id)
    expect(setProvidersConfig).toHaveBeenCalledOnce()
    expect(updatedProviders).toHaveLength(3)

    const duplicatedProvider = updatedProviders?.[2] as DeepSeekProviderConfig
    expect(duplicatedProvider).toEqual({
      ...sourceProvider,
      id: newProviderId,
      name: "DeepSeek 2",
    })
    expect(duplicatedProvider).not.toBe(sourceProvider)
    expect(duplicatedProvider.model).not.toBe(sourceProvider.model)
    expect(setSelectedProviderId).toHaveBeenCalledWith(newProviderId)
  })
})
