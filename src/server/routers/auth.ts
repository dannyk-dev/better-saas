import { paymentConfig } from '@/config';
import { auth } from '@/lib/auth/auth';

import {  pub } from '@/server/orpc';
import { createResponseSchema } from '@/types/schemas';
import { signUpSchema, userSchema } from '@/types/schemas/auth.schema';
import { headers } from 'next/headers';

export const signUp = pub
	.route({
		method: 'POST',
		path: '/auth/signup',
		summary: 'Sign up a new user',
		tags: ['Authentication'],
	})
	.input(signUpSchema)
	.output(createResponseSchema(userSchema))
	.handler(async ({ input }) => {
		const result = await auth.api.signUpEmail({
			body: input,
			headers: await headers(),
		});

		return {
      data: result.user,
      success: true,
    }
	});
