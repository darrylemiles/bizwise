import { z } from "zod"

export const settingsFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50, "Username is too long"),
  password: z.string().max(100, "Password is too long").optional(),
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>
