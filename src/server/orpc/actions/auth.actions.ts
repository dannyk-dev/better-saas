'use server';

import { auth } from '@/lib/auth/auth';
import { creditService } from '@/lib/credits';
import { pub } from '@/server/orpc';
import { ApiResponse } from '@/types/schemas';
import { signUpSchema } from '@/types/schemas/auth.schema';
import { userSchema } from 'better-auth/db';
import { headers } from 'next/headers';

export const signUpAction = pub
	.input(signUpSchema)
	.output(ApiResponse(userSchema))
	.handler(async ({ context, input }) => {
		const res = await auth.api.signUpEmail({ body: input, headers: await headers() });
		await creditService.initializeCredits(res.user.id);

    if (!res) {
      return {success: false, error: "Failed to sign up", data: {}}
    }
		return { success: true, data: res.user };
	}).actionable();
