import { requiredAuthMiddleware } from '@/middlewares/auth';
import { dbProviderMiddleware } from '@/middlewares/db';
import { ApiResponse } from '@/types/schemas';
import { userIdSchema, userInitializeCreditSchema } from '@/types/schemas/user.schema';
import { oc, type InferContractRouterOutputs } from '@orpc/contract';
import { implement } from '@orpc/server';

export const CreditsContract = {
	initializeForUser: oc
		.route({
			path: '/credits/initialize',
			method: 'POST',
			summary: 'SAAS credits',
			tags: ['Authentication', 'Subscription', 'Stripe'],
		})
		.input(userIdSchema)
		.output(ApiResponse(userInitializeCreditSchema)),
};

export type TCreditsContractOutput = InferContractRouterOutputs<typeof CreditsContract>;

export const creditsContract = implement(CreditsContract);
export const creditsPub = creditsContract.use(dbProviderMiddleware);
export const creditsProtected = creditsContract.use(requiredAuthMiddleware);
