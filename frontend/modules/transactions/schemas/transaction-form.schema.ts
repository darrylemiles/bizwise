import { z } from "zod"

export const transactionFormSchema = z.object({
  type: z.enum(["income", "expense", "loan", "capital", "transfer"]),
  amount: z.coerce.number().finite().positive("Amount must be greater than zero"),
  account: z.string().min(1, "Account is required"),
  destinationAccount: z.string().optional(),
  category: z.string().optional(),
  description: z.string().trim().max(500, "Description is too long"),
  reference: z.string().trim().max(100, "Reference is too long"),
  date: z.string().min(1, "Date is required"),
}).superRefine((values, context) => {
  if (values.type === "transfer" && !values.destinationAccount) context.addIssue({ code: "custom", path: ["destinationAccount"], message: "Destination account is required" })
  if ((values.type === "income" || values.type === "expense") && !values.category) context.addIssue({ code: "custom", path: ["category"], message: "Category is required" })
  if (values.type === "transfer" && values.account === values.destinationAccount) context.addIssue({ code: "custom", path: ["destinationAccount"], message: "Choose a different destination account" })
})

export type TransactionFormValues = z.infer<typeof transactionFormSchema>
