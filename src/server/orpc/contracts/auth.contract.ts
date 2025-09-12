import * as z from 'zod/v4';
import { sessionSchema, signInSchema, signUpSchema, UpdateUserSchema, userSchema } from '@/types/schemas/auth.schema';
import { ApiResponse } from '@/types/schemas';
import { oc, type InferContractRouterOutputs } from '@orpc/contract';
import { implement } from '@orpc/server';
import { dbProviderMiddleware } from '@/middlewares/db';
import { requiredAuthMiddleware } from '@/middlewares/auth';

export const AuthContract = {
	signUp: oc
		.route({
			path: '/auth/signup',
			method: 'POST',
		})
		.input(signUpSchema)
		.output(ApiResponse(userSchema)),
	signIn: oc
		.route({
			method: 'POST',
			path: '/auth/signin',
		})
		.input(signInSchema)
		.output(ApiResponse(userSchema)),
	signOut: oc
		.route({
			method: 'POST',
			path: '/auth/signout',
		})
		.input(z.void())
		.output(ApiResponse(z.object({ ok: z.boolean() }))),
	getSession: oc
		.route({
			method: 'GET',
			path: '/auth/session',
		})
		.input(z.void())
		.output(ApiResponse(z.object({ user: userSchema.nullable(), session: sessionSchema.nullable() }).optional())),
	updateUser: oc
		.route({
			method: 'PATCH',
			path: '/auth/user',
		})
		.input(UpdateUserSchema)
		.output(ApiResponse(z.object({ ok: z.boolean() }))),
} as const;

export type TAuthContractOutput = InferContractRouterOutputs<typeof AuthContract>;

export const authContract = implement(AuthContract);
export const authPub = authContract.use(dbProviderMiddleware);
export const authProtected = authPub.use(requiredAuthMiddleware);
