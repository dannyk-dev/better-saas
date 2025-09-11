import { paymentConfig } from '@/config';
import { creditService } from '@/lib/credits';
// import type { creditService } from "@/lib/credits";
import { quotaService } from '@/lib/quota/quota-service';
import { authed } from '@/server/orpc';
import { createResponseSchema } from '@/types/schemas';
import { userIdSchema, userInitializeCreditSchema } from '@/types/schemas/user.schema';
import { ORPCError } from '@orpc/client';

export const initializeUsersCredits = authed
	.route({
		method: 'POST',
		path: '/api/credits/initialize',
		summary: 'SAAS credits',
		tags: ['Authentication', 'Subscription', 'Stripe'],
	})
	.input(userIdSchema)
	.output(createResponseSchema(userInitializeCreditSchema))
	.handler(async ({ input, context }) => {
		const { id } = context.user;

		if (input.userId !== id) {
			throw new ORPCError('FORBIDDEN', {
				message: 'Forbidden: Can only initialize your own credits',
			});
		}

		let creditAccount = null;
		let lastError = null;

		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				creditAccount = await creditService.getOrCreateCreditAccount(input.userId);
				break;
			} catch (err) {
				lastError = err;
				const delay = 200 * attempt;
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		if (!creditAccount) {
			throw (
				lastError ??
				new ORPCError('INTERNAL_SERVER_ERROR', {
					message: 'Failed to initialize credit account after retries',
				})
			);
		}

		const signupReferenceId = `signup_${input.userId}`;
		const existingSignupTransaction = await creditService
			.getTransactionHistory(input.userId, 100)
			.then((txs) => txs.find((tx) => tx.referenceId === signupReferenceId))
			.catch(() => null);
		const alreadyReceivedBonus = !!existingSignupTransaction;

		let isNewAccount = false;
		if (!alreadyReceivedBonus) {
			try {
				const existingTransactions = await creditService.getTransactionHistory(input.userId, 1);
				isNewAccount = existingTransactions.length === 0;
			} catch (txErr) {
				isNewAccount = creditAccount.totalEarned === 0 && creditAccount.totalSpent === 0;
			}
		}

		let signupCreditsGranted = 0;
		if (isNewAccount && !alreadyReceivedBonus) {
			const freePlan = paymentConfig.plans.find((p) => p.id === 'free');
			const signupCredits = freePlan?.credits?.onSignup;

			if (signupCredits && signupCredits > 0) {
				await creditService.earnCredits({
					userId: input.userId,
					amount: signupCredits,
					source: 'bonus',
					description: 'Welcome bonus - thank you for signing up!',
					referenceId: signupReferenceId,
				});
				signupCreditsGranted = signupCredits;
				console.log(`✅ Granted ${signupCredits} signup bonus credits to ${context.user.email}`);
			}
		} else if (alreadyReceivedBonus) {
			console.log(`⚠️ Signup bonus already granted to ${context.user.email}, skipping`);
		}

		// Initialize quota usage tracking
		try {
			await quotaService.initializeForUser(input.userId);
			console.log(`✅ Initialized quota tracking for ${context.user.email}`);
		} catch (quotaErr) {
			console.error(`Failed to initialize quota for ${context.user.email}:`, quotaErr);
		}

		console.log(`🎉 Successfully initialized credit account for user ${context.user.email}`);

		return {
			data: {
				creditAccount,
				signupCreditsGranted,
				isNewAccount,
			},
			success: true,
		};
	});
