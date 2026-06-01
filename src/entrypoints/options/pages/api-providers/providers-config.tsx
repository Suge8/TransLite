import type { APIProviderConfig } from "@/types/config/provider"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { i18n } from "#imports"
import ProviderIcon from "@/components/provider-icon"
import { useTheme } from "@/components/providers/theme-provider"
import { Badge } from "@/components/ui/base-ui/badge"
import { Switch } from "@/components/ui/base-ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/base-ui/tooltip"
import { configAtom, configFieldsAtomMap } from "@/utils/atoms/config"
import { providerConfigAtom } from "@/utils/atoms/provider"
import { getAPIProvidersConfig } from "@/utils/config/helpers"
import { FEATURE_KEYS, FEATURE_PROVIDER_DEFS, getFeatureLabelI18nKey } from "@/utils/constants/feature-providers"
import { API_PROVIDER_ITEMS } from "@/utils/constants/providers"
import { cn } from "@/utils/styles/utils"
import { EntityEditorLayout } from "../../components/entity-editor-layout"
import { EntityListRail } from "../../components/entity-list-rail"
import { selectedProviderIdAtom } from "./atoms"
import { ProviderConfigForm } from "./provider-config-form"

export function ProvidersConfig() {
  const selectedProviderId = useAtomValue(selectedProviderIdAtom)

  return (
    <section id="api-providers" className="pt-7">
      <h2 className="mb-2.5 flex items-center gap-1.5 px-0.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground/70">
        <span className="size-1.5 rounded-full bg-gradient-to-br from-brand-from to-brand-to" />
        {i18n.t("options.apiProviders.title")}
      </h2>
      <EntityEditorLayout list={<ProviderCardList />} editor={<ProviderConfigForm key={selectedProviderId} />} />
    </section>
  )
}

function ProviderCardList() {
  const providersConfig = useAtomValue(configFieldsAtomMap.providersConfig)
  const apiProvidersConfig = getAPIProvidersConfig(providersConfig)
  const [selectedProviderId, setSelectedProviderId] = useAtom(selectedProviderIdAtom)
  const didLockInitialSelectionRef = useRef(false)

  useEffect(() => {
    if (didLockInitialSelectionRef.current)
      return
    if (selectedProviderId) {
      setSelectedProviderId(selectedProviderId)
      didLockInitialSelectionRef.current = true
    }
  }, [selectedProviderId, setSelectedProviderId])

  return (
    <div className="flex flex-col gap-4">
      <EntityListRail>
        <div className="flex flex-col gap-4 pt-2">
          {apiProvidersConfig.map(providerConfig => (
            <ProviderCard key={providerConfig.id} providerConfig={providerConfig} />
          ))}
        </div>
      </EntityListRail>
    </div>
  )
}

function ProviderCard({ providerConfig }: { providerConfig: APIProviderConfig }) {
  const { id, name, provider, enabled } = providerConfig
  const { theme } = useTheme()
  const [selectedProviderId, setSelectedProviderId] = useAtom(selectedProviderIdAtom)
  const setProviderConfig = useSetAtom(providerConfigAtom(id))
  const config = useAtomValue(configAtom)

  const assignedFeatures = FEATURE_KEYS
    .filter(key => FEATURE_PROVIDER_DEFS[key].getProviderId(config) === id)
  const isLanguageDetectionProvider = config.languageDetection.mode === "llm"
    && config.languageDetection.providerId === id
  const totalAssigned = assignedFeatures.length + (isLanguageDetectionProvider ? 1 : 0)

  const handleProviderEnabledChange = (checked: boolean) => {
    if (!checked && enabled && totalAssigned > 0) {
      toast.error(i18n.t("options.apiProviders.form.providerInUseCannotDisable", [name, totalAssigned]))
      return
    }

    void setProviderConfig({ ...providerConfig, enabled: checked })
  }

  return (
    <div
      className={cn(
        "rounded-xl p-3 border bg-card relative",
        selectedProviderId === id && "border-primary",
      )}
      onClick={() => setSelectedProviderId(id)}
    >
      {totalAssigned > 0 && (
        <div className="absolute -top-2 right-2 flex items-center justify-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={(
                <Badge className="bg-blue-500 cursor-default" size="sm" />
              )}
            >
              {i18n.t("options.apiProviders.badges.featureCount", [totalAssigned])}
            </TooltipTrigger>
            <TooltipContent>
              <ul className="list-disc list-inside marker:text-green-500">
                {assignedFeatures.map(key => (
                  <li key={key}>{i18n.t(getFeatureLabelI18nKey(key))}</li>
                ))}
                {isLanguageDetectionProvider && (
                  <li>{i18n.t("options.general.languageDetection.title")}</li>
                )}
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <ProviderIcon logo={API_PROVIDER_ITEMS[provider].logo(theme)} name={name} size="base" textClassName="text-sm" />
        <Switch
          checked={enabled}
          onCheckedChange={handleProviderEnabledChange}
          onPointerDown={event => event.stopPropagation()}
          onClick={event => event.stopPropagation()}
        />
      </div>
    </div>
  )
}
