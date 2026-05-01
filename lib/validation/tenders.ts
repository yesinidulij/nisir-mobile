import * as z from 'zod';

const statusValues = ['DRAFT', 'OPEN', 'CLOSING_SOON', 'CLOSED'] as const;

const stringValidator = (
  field: string,
  min: number,
  max: number,
  options?: { required?: boolean }
) => {
  const schema = z
    .string({ message: `${field} field is required` })
    .trim()
    .min(min, {
      message: `${field} field must be at least ${min} characters long`,
    })
    .max(max, {
      message: `${field} field must be at most ${max} characters long`,
    });

  return options?.required === false ? schema.optional() : schema;
};

const nullableStringValidator = (field: string, min: number, max: number) =>
  z
    .string({ message: `${field} field must be a string` })
    .trim()
    .min(min, {
      message: `${field} field must be at least ${min} characters long`,
    })
    .max(max, {
      message: `${field} field must be at most ${max} characters long`,
    })
    .optional()
    .or(z.literal(''))
    .or(z.null())
    .transform((value) => {
      if (value === null) {
        return null;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length === 0 ? null : trimmed;
      }

      return value;
    });

const dateValidator = (field: string) =>
  z.preprocess(
    (value) => {
      if (value instanceof Date) {
        return value;
      }

      if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
          return parsed;
        }
      }

      return value;
    },
    z.date({
      message: `${field} field is required`,
    })
  );

const stringArrayValidator = (field: string) =>
  z
    .array(
      z
        .string({ message: `${field} entries must be strings` })
        .trim()
        .min(1, { message: `${field} entries cannot be empty` })
        .max(1000, {
          message: `${field} entries must be at most 1000 characters long`,
        })
    )
    .optional();

export const createTenderSchema = z.object({
  title: stringValidator('Title', 5, 200),
  summary: nullableStringValidator('Summary', 10, 400),
  description: z.string({ message: 'Description is required' }).min(10, { message: 'Description must be at least 10 characters' }),
  categoryId: stringValidator('Category', 2, 120),
  location: stringValidator('Location', 2, 120),
  deadline: dateValidator('Deadline'),
  status: z.enum(statusValues, {
    message: 'Status must be a string',
  }),
  requirements: stringArrayValidator('Requirements'),
  companyName: nullableStringValidator('Company Name', 2, 120),
  companyWebsite: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')).or(z.null()),
});

export type CreateTenderSchemaInput = z.input<typeof createTenderSchema>;
export type CreateTenderSchemaOutput = z.output<typeof createTenderSchema>;
