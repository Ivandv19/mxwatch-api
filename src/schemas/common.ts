import { z } from '@hono/zod-openapi';

export const ErrorSchema = z.object({
  success: z.literal(false),
  error: z.string().openapi({
    example: 'Description of the error',
  }),
  details: z.string().optional(),
}).openapi('ErrorResponse');

export function createSuccessSchema<T extends z.ZodTypeAny>(dataSchema: T, name: string) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.string().datetime().optional(),
    count: z.number().optional(),
  }).openapi(name);
}
