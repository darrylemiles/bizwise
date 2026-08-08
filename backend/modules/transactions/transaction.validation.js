import { z } from 'zod';

const transactionTypes = [
  'income',
  'expense',
  'loan',
  'capital',
  'transfer',
];

const createTransactionSchema = z
  .object({
    type: z.enum(transactionTypes),

    amount: z
      .number()
      .positive('Amount must be greater than 0'),

    account: z
      .string()
      .min(1, 'Account is required'),

    destinationAccount: z
      .string()
      .optional(),

    category: z
      .string()
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, 'Description must not exceed 500 characters')
      .optional(),

    reference: z
      .string()
      .trim()
      .max(100, 'Reference must not exceed 100 characters')
      .optional(),

    date: z
      .coerce
      .date()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === 'transfer' &&
      !data.destinationAccount
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['destinationAccount'],
        message:
          'Destination account is required for transfers',
      });
    }

    if (
      data.type !== 'transfer' &&
      data.destinationAccount
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['destinationAccount'],
        message:
          'Destination account is only allowed for transfers',
      });
    }

    if (
      data.type === 'income' &&
      !data.category
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['category'],
        message:
          'Category is required for income transactions',
      });
    }

    if (
      data.type === 'expense' &&
      !data.category
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['category'],
        message:
          'Category is required for expense transactions',
      });
    }
  });

const updateTransactionSchema = z
  .object({
    type: z.enum(transactionTypes).optional(),

    amount: z
      .number()
      .positive('Amount must be greater than 0')
      .optional(),

    account: z
      .string()
      .min(1, 'Account is required')
      .optional(),

    destinationAccount: z
      .string()
      .optional()
      .nullable(),

    category: z
      .string()
      .optional()
      .nullable(),

    description: z
      .string()
      .trim()
      .max(500, 'Description must not exceed 500 characters')
      .optional(),

    date: z
      .coerce
      .date()
      .optional(),
  });

export {
  createTransactionSchema,
  updateTransactionSchema,
};