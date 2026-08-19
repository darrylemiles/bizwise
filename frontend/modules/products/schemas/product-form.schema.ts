import { z } from "zod"

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150, "Name is too long"),
  category: z.string().min(1, "Category is required"),
  unitType: z.enum(["count", "weight", "volume"]),
  unit: z.enum(["piece", "box", "pack", "sack", "gram", "kilogram", "milliliter", "liter"]),
  costPrice: z.coerce.number().finite().min(0, "Cost price cannot be negative"),
  sellingPrice: z.coerce.number().finite().min(0, "Selling price cannot be negative"),
  quantity: z.coerce.number().finite().min(0, "Quantity cannot be negative"),
  lowStockThreshold: z.coerce.number().finite().min(0, "Threshold cannot be negative"),
  status: z.enum(["active", "inactive"]),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
