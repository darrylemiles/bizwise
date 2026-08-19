import { z } from "zod"

export const goalContributionSchema = z.object({
  amount: z.coerce.number().finite().positive("Contribution must be greater than zero"),
})

export type GoalContributionValues = z.infer<typeof goalContributionSchema>
