import { signUp } from '@/server/orpc/routers/auth.router';
import { initializeUsersCredits } from '@/server/orpc/routers/credits.router';


export const router = {
	users: {
		signUp,
	},
	credits: {
		initializeUsersCredits,
	},
};
