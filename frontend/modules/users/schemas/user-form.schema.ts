import { z } from "zod"

export const userFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50, "Username is too long"),
  password: z.string().optional(),
  role: z.enum(["user", "admin"]),
})

export type UserFormValues = z.infer<typeof userFormSchema>
