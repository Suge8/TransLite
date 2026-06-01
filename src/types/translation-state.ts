import { z } from "zod"

export const translationStateSourceSchema = z.enum(["manual", "auto"])
export type TranslationStateSource = z.infer<typeof translationStateSourceSchema>

export const translationStateSchema = z.object({
  enabled: z.boolean(),
  origin: z.string().optional(),
  source: translationStateSourceSchema.optional(),
})

export type TranslationState = z.infer<typeof translationStateSchema>
