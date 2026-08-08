import { z } from 'zod';

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters'),

  description: z
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  type: z
    .enum(['product', 'expense', 'both'])
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters')
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  type: z
    .enum(['product', 'expense', 'both'])
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export {
  createCategorySchema,
  updateCategorySchema,
};