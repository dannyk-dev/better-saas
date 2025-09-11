import { signUp } from '@/server/routers/auth';
import { initializeUsersCredits } from '@/server/routers/credits';

export const router = {
	users: {
		signUp,
	},
	credits: {
		initializeUsersCredits,
	},
};
