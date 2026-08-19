import { z } from "zod"

export const saleFormSchema = z.object({
  account: z.string().min(1, "Account is required"),
  saleDate: z.string().min(1, "Sale date is required"),
  items: z.array(z.object({ product: z.string().min(1, "Product is required"), quantity: z.coerce.number().int().positive("Quantity must be at least 1") })).min(1, "Add at least one item"),
})

export type SaleFormValues = z.infer<typeof saleFormSchema>
