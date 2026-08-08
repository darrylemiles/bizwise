import { z } from 'zod';

const saleItemSchema = z.object({
  product: z
    .string()
    .min(1, 'Product is required'),

  quantity: z
    .number()
    .positive(
      'Quantity must be greater than zero'
    ),
});

const createSaleSchema = z.object({
  items: z
    .array(saleItemSchema)
    .min(
      1,
      'Sale must contain at least one item'
    ),

  account: z
    .string()
    .min(1, 'Account is required'),

  saleDate: z
    .string()
    .datetime()
    .optional(),
});

export {
  createSaleSchema,
};