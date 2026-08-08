import { z } from 'zod';

const createProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Product name must be at least 2 characters')
      .max(
        150,
        'Product name must not exceed 150 characters'
      ),

    category: z
      .string()
      .min(1, 'Category is required'),

    unitType: z.enum([
      'count',
      'weight',
      'volume',
    ]),

    unit: z.enum([
      'piece',
      'box',
      'pack',
      'sack',
      'gram',
      'kilogram',
      'milliliter',
      'liter',
    ]),

    costPrice: z
      .number()
      .min(0, 'Cost price cannot be negative'),

    sellingPrice: z
      .number()
      .min(0, 'Selling price cannot be negative'),

    quantity: z
      .number()
      .min(0, 'Quantity cannot be negative')
      .default(0),

    lowStockThreshold: z
      .number()
      .min(0, 'Low stock threshold cannot be negative')
      .default(0),

    status: z
      .enum(['active', 'inactive'])
      .optional(),
  })
  .superRefine((data, ctx) => {
    const validUnits = {
      count: [
        'piece',
        'box',
        'pack',
        'sack',
      ],

      weight: [
        'gram',
        'kilogram',
      ],

      volume: [
        'milliliter',
        'liter',
      ],
    };

    if (!validUnits[data.unitType].includes(data.unit)) {
      ctx.addIssue({
        code: 'custom',
        path: ['unit'],
        message: `${data.unit} is not a valid unit for ${data.unitType}`,
      });
    }
  });

const updateProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Product name must be at least 2 characters')
      .max(
        150,
        'Product name must not exceed 150 characters'
      )
      .optional(),

    category: z
      .string()
      .min(1, 'Category is required')
      .optional(),

    unitType: z
      .enum([
        'count',
        'weight',
        'volume',
      ])
      .optional(),

    unit: z
      .enum([
        'piece',
        'box',
        'pack',
        'sack',
        'gram',
        'kilogram',
        'milliliter',
        'liter',
      ])
      .optional(),

    costPrice: z
      .number()
      .min(0, 'Cost price cannot be negative')
      .optional(),

    sellingPrice: z
      .number()
      .min(0, 'Selling price cannot be negative')
      .optional(),

    lowStockThreshold: z
      .number()
      .min(0, 'Low stock threshold cannot be negative')
      .optional(),

    status: z
      .enum(['active', 'inactive'])
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field is required',
    }
  );

const adjustStockSchema = z.object({
  quantity: z
    .number()
    .refine(
      (value) => value !== 0,
      'Quantity adjustment cannot be zero'
    ),

  reason: z
    .string()
    .trim()
    .min(
      2,
      'Reason must be at least 2 characters'
    )
    .max(
      255,
      'Reason must not exceed 255 characters'
    ),
});

export {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
};