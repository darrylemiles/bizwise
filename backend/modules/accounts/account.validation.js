import { z } from 'zod';

const createAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Account name must be at least 2 characters')
    .max(100, 'Account name must not exceed 100 characters'),

  type: z.enum(
    ['cash', 'bank', 'e-wallet'],
    {
      message: 'Account type must be cash, bank, or e-wallet',
    }
  ),

  description: z
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

const updateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Account name must be at least 2 characters')
    .max(100, 'Account name must not exceed 100 characters')
    .optional(),

  type: z
    .enum(['cash', 'bank', 'e-wallet'], {
      message: 'Account type must be cash, bank, or e-wallet',
    })
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export {
  createAccountSchema,
  updateAccountSchema,
};