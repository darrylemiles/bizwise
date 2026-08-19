import { z } from "zod"

export const financialGoalFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150, "Name is too long"),
  description: z.string().trim().max(500, "Description is too long"),
  targetAmount: z.coerce.number().finite().positive("Target amount must be greater than zero"),
  deadline: z.string().min(1, "Deadline is required"),
  account: z.string().min(1, "Account is required"),
  status: z.enum(["active", "completed", "cancelled"]),
})

export type FinancialGoalFormValues = z.infer<typeof financialGoalFormSchema>
