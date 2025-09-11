import * as z from "zod/v4";


export const createResponseSchema = (schema: z.ZodObject) => {
  return z.object({
    data: schema,
    success: z.boolean().optional(),
    error: z.string().optional()
  });
}
