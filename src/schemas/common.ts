import { z } from '@hono/zod-openapi';

/**
 * Estructuras estándar de respuesta (éxito/error).
 */

// --- 1. GESTIÓN DE ERRORES ---

/**
 * Respuesta de error universal.
 */
export const ErrorSchema = z.object({
  success: z.literal(false),
  error: z.string().openapi({
    example: 'Unauthorized - Invalid API Key',
  }),
  details: z.string().optional(),
}).openapi('ErrorResponse');

// --- 2. GENERADORES DE ÉXITO ---

/**
 * Wrapper de respuesta exitosa con timestamp y conteo opcional.
 */
export function createSuccessSchema<T extends z.ZodTypeAny>(dataSchema: T, name: string) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.string().datetime().optional(),
    count: z.number().optional(),
  }).openapi(name);
}
