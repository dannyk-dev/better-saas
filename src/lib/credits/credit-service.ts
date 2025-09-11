import { and, desc, eq, sql } from 'drizzle-orm';
import db from '@/server/db';
import { creditTransactions, userCredits } from '@/server/db/schema';
import { DatabaseError } from '@/server/db/types';
import type { TDefaultInitializedCreditSchema } from '@/types/schemas/user.schema';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { orpc } from '@/lib/orpc/orpc';
import { call, ORPCError } from '@orpc/server';
import { paymentConfig } from '@/config';
import { quotaService } from '@/lib/quota/quota-service';
import type { input } from '@heroui/react';

// Credit transaction types
export type CreditTransactionType = 'earn' | 'spend' | 'refund' | 'admin_adjust' | 'freeze' | 'unfreeze';
export type CreditTransactionSource = 'subscription' | 'api_call' | 'admin' | 'storage' | 'bonus';

export interface CreditTransaction {
	id: string;
	userId: string;
	type: CreditTransactionType;
	amount: number;
	balanceAfter: number;
	source: CreditTransactionSource;
	description?: string;
	referenceId?: string;
	metadata?: string;
	createdAt: Date;
}

export interface UserCreditAccount {
	id: string;
	userId: string;
	balance: number;
	totalEarned: number;
	totalSpent: number;
	frozenBalance: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface EarnCreditsParams {
	userId: string;
	amount: number;
	source: CreditTransactionSource;
	description?: string;
	referenceId?: string;
	metadata?: Record<string, unknown>;
}

export interface SpendCreditsParams {
	userId: string;
	amount: number;
	source: CreditTransactionSource;
	description?: string;
	referenceId?: string;
	metadata?: Record<string, unknown>;
}

export class CreditService {
	async initializeCredits(userId: string): Promise<TDefaultInitializedCreditSchema> {
		const { data } = await orpc.auth.getSession.call();

		if (!data || !data.user || data.user?.id !== userId) {
			throw new ORPCError('FORBIDDEN', {
				message: 'Forbidden: Can only initialize your own credits',
			});
		}

		let creditAccount = null;
		let lastError = null;

		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				creditAccount = await creditService.getOrCreateCreditAccount(userId);
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

		const signupReferenceId = `signup_${userId}`;
		const existingSignupTransaction = await creditService
			.getTransactionHistory(userId, 100)
			.then((txs) => txs.find((tx) => tx.referenceId === signupReferenceId))
			.catch(() => null);
		const alreadyReceivedBonus = !!existingSignupTransaction;

		let isNewAccount = false;
		if (!alreadyReceivedBonus) {
			try {
				const existingTransactions = await creditService.getTransactionHistory(userId, 1);
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
					userId: userId,
					amount: signupCredits,
					source: 'bonus',
					description: 'Welcome bonus - thank you for signing up!',
					referenceId: signupReferenceId,
				});
				signupCreditsGranted = signupCredits;
				console.log(`✅ Granted ${signupCredits} signup bonus credits to ${data.user.email}`);
			}
		} else if (alreadyReceivedBonus) {
			console.log(`⚠️ Signup bonus already granted to ${data.user.email}, skipping`);
		}

		// Initialize quota usage tracking
		try {
			await quotaService.initializeForUser(data.user.id);
			console.log(`✅ Initialized quota tracking for ${data.user.email}`);
		} catch (quotaErr) {
			console.error(`Failed to initialize quota for ${data.user.email}:`, quotaErr);
		}

		console.log(`🎉 Successfully initialized credit account for user ${data.user.email}`);

		return {
			creditAccount,
			signupCreditsGranted,
			isNewAccount,
		};
	}

	/**
	 * Create a credit account for a new user
	 */
	async createCreditAccount(userId: string): Promise<UserCreditAccount> {
		try {
			const creditAccount = await db
				.insert(userCredits)
				.values({
					id: crypto.randomUUID(),
					userId,
					balance: 0,
					totalEarned: 0,
					totalSpent: 0,
					frozenBalance: 0,
				})
				.returning();

			return creditAccount[0] as UserCreditAccount;
		} catch (error) {
			throw new DatabaseError(`Failed to create credit account: ${error}`);
		}
	}

	/**
	 * Get user's credit account
	 */
	async getCreditAccount(userId: string): Promise<UserCreditAccount | null> {
		try {
			const account = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

			return (account[0] as UserCreditAccount) || null;
		} catch (error) {
			throw new DatabaseError(`Failed to get credit account: ${error}`);
		}
	}

	/**
	 * Get or create user's credit account
	 */
	async getOrCreateCreditAccount(userId: string): Promise<UserCreditAccount> {
		let account = await this.getCreditAccount(userId);

		if (!account) {
			account = await this.createCreditAccount(userId);
		}

		return account;
	}

	/**
	 * Earn credits (add to balance)
	 */
	async earnCredits(params: EarnCreditsParams): Promise<CreditTransaction> {
		const { userId, amount, source, description, referenceId, metadata } = params;

		if (amount <= 0) {
			throw new Error('Amount must be positive');
		}

		try {
			// Get or create credit account
			let account = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

			if (account.length === 0) {
				// Create account if doesn't exist
				await db.insert(userCredits).values({
					id: crypto.randomUUID(),
					userId,
					balance: 0,
					totalEarned: 0,
					totalSpent: 0,
					frozenBalance: 0,
				});

				account = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
			}

			const currentAccount = account[0];
			if (!currentAccount) {
				throw new Error('Failed to retrieve credit account after creation');
			}
			const newBalance = currentAccount.balance + amount;
			const newTotalEarned = currentAccount.totalEarned + amount;

			// Update credit account
			await db
				.update(userCredits)
				.set({
					balance: newBalance,
					totalEarned: newTotalEarned,
					updatedAt: new Date(),
				})
				.where(eq(userCredits.userId, userId));

			// Create transaction record
			const transaction = await db
				.insert(creditTransactions)
				.values({
					id: crypto.randomUUID(),
					userId,
					type: 'earn',
					amount,
					balanceAfter: newBalance,
					source,
					description,
					referenceId,
					metadata: metadata ? JSON.stringify(metadata) : null,
				})
				.returning();

			return transaction[0] as CreditTransaction;
		} catch (error) {
			throw new DatabaseError(`Failed to earn credits: ${error}`);
		}
	}

	/**
	 * Spend credits (deduct from balance)
	 */
	async spendCredits(params: SpendCreditsParams): Promise<CreditTransaction> {
		const { userId, amount, source, description, referenceId, metadata } = params;

		if (amount <= 0) {
			throw new Error('Amount must be positive');
		}

		try {
			// Get credit account
			const account = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

			if (account.length === 0) {
				throw new Error('Credit account not found');
			}

			const currentAccount = account[0];
			if (!currentAccount) {
				throw new Error('Credit account not found');
			}
			const availableBalance = currentAccount.balance - currentAccount.frozenBalance;

			if (availableBalance < amount) {
				throw new Error('Insufficient credits');
			}

			const newBalance = currentAccount.balance - amount;
			const newTotalSpent = currentAccount.totalSpent + amount;

			// Update credit account
			await db
				.update(userCredits)
				.set({
					balance: newBalance,
					totalSpent: newTotalSpent,
					updatedAt: new Date(),
				})
				.where(eq(userCredits.userId, userId));

			// Create transaction record
			const transaction = await db
				.insert(creditTransactions)
				.values({
					id: crypto.randomUUID(),
					userId,
					type: 'spend',
					amount,
					balanceAfter: newBalance,
					source,
					description,
					referenceId,
					metadata: metadata ? JSON.stringify(metadata) : null,
				})
				.returning();

			return transaction[0] as CreditTransaction;
		} catch (error) {
			throw new DatabaseError(`Failed to spend credits: ${error}`);
		}
	}

	/**
	 * Check if user has enough credits
	 */
	async hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
		try {
			const account = await this.getCreditAccount(userId);
			if (!account) return false;

			const availableBalance = account.balance - account.frozenBalance;
			return availableBalance >= amount;
		} catch (error) {
			throw new DatabaseError(`Failed to check credit balance: ${error}`);
		}
	}

	/**
	 * Get credit transaction history
	 */
	async getTransactionHistory(userId: string, limit = 50, offset = 0): Promise<CreditTransaction[]> {
		try {
			const transactions = await db
				.select()
				.from(creditTransactions)
				.where(eq(creditTransactions.userId, userId))
				.orderBy(desc(creditTransactions.createdAt))
				.limit(limit)
				.offset(offset);

			return transactions as CreditTransaction[];
		} catch (error) {
			throw new DatabaseError(`Failed to get transaction history: ${error}`);
		}
	}

	/**
	 * Refund credits
	 */
	async refundCredits(params: EarnCreditsParams): Promise<CreditTransaction> {
		return await this.earnCredits({
			...params,
			source: params.source,
			description: `Refund: ${params.description || ''}`,
		});
	}

	/**
	 * Admin adjust credits (can be positive or negative)
	 */
	async adminAdjustCredits(
		userId: string,
		amount: number,
		description?: string,
		referenceId?: string
	): Promise<CreditTransaction> {
		if (amount > 0) {
			return await this.earnCredits({
				userId,
				amount,
				source: 'admin',
				description: `Admin adjustment: ${description || 'Credit adjustment'}`,
				referenceId,
			});
		}

		return await this.spendCredits({
			userId,
			amount: Math.abs(amount),
			source: 'admin',
			description: `Admin adjustment: ${description || 'Credit adjustment'}`,
			referenceId,
		});
	}

	/**
	 * Freeze credits (make them unavailable for spending)
	 */
	async freezeCredits(
		userId: string,
		amount: number,
		description?: string,
		referenceId?: string
	): Promise<CreditTransaction> {
		if (amount <= 0) {
			throw new Error('Amount must be positive');
		}

		try {
			const account = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

			if (account.length === 0) {
				throw new Error('Credit account not found');
			}

			const currentAccount = account[0];
			if (!currentAccount) {
				throw new Error('Credit account not found');
			}
			const availableBalance = currentAccount.balance - currentAccount.frozenBalance;

			if (availableBalance < amount) {
				throw new Error('Insufficient available credits to freeze');
			}

			const newFrozenBalance = currentAccount.frozenBalance + amount;

			// Update frozen balance
			await db
				.update(userCredits)
				.set({
					frozenBalance: newFrozenBalance,
					updatedAt: new Date(),
				})
				.where(eq(userCredits.userId, userId));

			// Create transaction record
			const transaction = await db
				.insert(creditTransactions)
				.values({
					id: crypto.randomUUID(),
					userId,
					type: 'freeze',
					amount,
					balanceAfter: currentAccount.balance, // Balance doesn't change, only frozen amount
					source: 'admin',
					description: description || 'Credits frozen',
					referenceId,
				})
				.returning();

			return transaction[0] as CreditTransaction;
		} catch (error) {
			throw new DatabaseError(`Failed to freeze credits: ${error}`);
		}
	}

	/**
	 * Unfreeze credits
	 */
	async unfreezeCredits(
		userId: string,
		amount: number,
		description?: string,
		referenceId?: string
	): Promise<CreditTransaction> {
		if (amount <= 0) {
			throw new Error('Amount must be positive');
		}

		try {
			const account = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);

			if (account.length === 0) {
				throw new Error('Credit account not found');
			}

			const currentAccount = account[0];
			if (!currentAccount) {
				throw new Error('Credit account not found');
			}

			if (currentAccount.frozenBalance < amount) {
				throw new Error('Cannot unfreeze more credits than are frozen');
			}

			const newFrozenBalance = currentAccount.frozenBalance - amount;

			// Update frozen balance
			await db
				.update(userCredits)
				.set({
					frozenBalance: newFrozenBalance,
					updatedAt: new Date(),
				})
				.where(eq(userCredits.userId, userId));

			// Create transaction record
			const transaction = await db
				.insert(creditTransactions)
				.values({
					id: crypto.randomUUID(),
					userId,
					type: 'unfreeze',
					amount,
					balanceAfter: currentAccount.balance, // Balance doesn't change, only frozen amount
					source: 'admin',
					description: description || 'Credits unfrozen',
					referenceId,
				})
				.returning();

			return transaction[0] as CreditTransaction;
		} catch (error) {
			throw new DatabaseError(`Failed to unfreeze credits: ${error}`);
		}
	}
}

// Export singleton instance
export const creditService = new CreditService();
