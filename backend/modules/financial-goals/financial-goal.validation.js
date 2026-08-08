import { z } from 'zod';

const createFinancialGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Goal name must be at least 2 characters')
    .max(100, 'Goal name must not exceed 100 characters'),

  description: z
    .string()
    .trim()
    .max(
      500,
      'Description must not exceed 500 characters'
    )
    .optional(),

  targetAmount: z
    .number()
    .positive(
      'Target amount must be greater than zero'
    ),

  deadline: z
    .string()
    .datetime(),

  account: z
    .string()
    .min(1, 'Account is required'),
});

const updateFinancialGoalSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    description: z
      .string()
      .trim()
      .max(500)
      .optional(),

    targetAmount: z
      .number()
      .positive()
      .optional(),

    deadline: z
      .string()
      .datetime()
      .optional(),

    account: z
      .string()
      .min(1)
      .optional(),

    status: z
      .enum([
        'active',
        'completed',
        'cancelled',
      ])
      .optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).length > 0,
    {
      message:
        'At least one field is required',
    }
  );

const contributeToGoalSchema = z.object({
  amount: z
    .number()
    .positive(
      'Contribution amount must be greater than zero'
    ),
});

export {
  createFinancialGoalSchema,
  updateFinancialGoalSchema,
  contributeToGoalSchema,
};