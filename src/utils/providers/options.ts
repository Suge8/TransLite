import type { JSONValue } from "ai"
import { LLM_MODEL_OPTIONS } from "../constants/models"

export function getProviderOptions(
  model: string,
  provider: string,
): Record<string, Record<string, JSONValue>> | undefined {
  const options = LLM_MODEL_OPTIONS.find(({ pattern }) => pattern.test(model))?.options
  return options ? { [provider]: options } : undefined
}
