import { z } from "zod"

export const stockAdjustmentSchema = z.object({
  quantity: z.coerce.number().finite().refine((value) => value !== 0, "Adjustment cannot be zero"),
  reason: z.string().trim().min(1, "Reason is required").max(200, "Reason is too long"),
})

export type StockAdjustmentValues = z.infer<typeof stockAdjustmentSchema>
