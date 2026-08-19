import { z } from "zod"

export const accountFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  type: z.enum(["cash", "bank", "e-wallet"]),
  description: z.string().trim().max(500, "Description is too long"),
})

export type AccountFormValues = z.infer<typeof accountFormSchema>
