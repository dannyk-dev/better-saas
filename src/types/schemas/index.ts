import * as z from 'zod/v4';

export const createResponseSchema = (schema: z.ZodObject) => {
	return z.object({
		data: schema,
		success: z.boolean().optional(),
		error: z.string().optional(),
	});
};

export const ApiResponse = <T = z.ZodAny>(data: T) =>
	z.object({ success: z.boolean(), data, error: z.string().optional() });
export type ApiResponse<T> = { success: boolean; data: T; error?: string };
