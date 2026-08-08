import { z } from 'zod';

const reportQuerySchema = z
  .object({
    from: z.coerce
      .date()
      .optional(),

    to: z.coerce
      .date()
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) {
        return true;
      }

      return data.from <= data.to;
    },
    {
      message:
        '"from" date cannot be after "to" date',
      path: ['from'],
    }
  );

export {
  reportQuerySchema,
};