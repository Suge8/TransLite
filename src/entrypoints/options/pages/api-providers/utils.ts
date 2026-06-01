import type { Config } from "@/types/config/config"
import type { APIProviderConfig } from "@/types/config/provider"
import { getRandomUUID } from "@/utils/crypto-polyfill"
import { getUniqueName } from "@/utils/name"

export async function duplicateProvider(
  providerConfig: APIProviderConfig,
  providersConfig: Config["providersConfig"],
  setProvidersConfig: (config: Partial<Config["providersConfig"]>) => Promise<void>,
  setSelectedProviderId?: (id: string) => void,
): Promise<string> {
  const existingNames = new Set(providersConfig.map(p => p.name))
  const newProvider: APIProviderConfig = {
    ...structuredClone(providerConfig),
    id: getRandomUUID(),
    name: getUniqueName(providerConfig.name, existingNames),
  }

  const updatedProviders = [...providersConfig, newProvider]
  await setProvidersConfig(updatedProviders)

  if (setSelectedProviderId) {
    setSelectedProviderId(newProvider.id)
  }

  return newProvider.id
}
