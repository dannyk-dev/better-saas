import authRouter from '@/server/orpc/routers/auth.router';
import { lazy, os, unlazyRouter } from '@orpc/server';
import auth from '@/server/orpc/routers/auth.router';

export const appRouter = os.router({
	auth,
	credits: lazy(() => import('@/server/orpc/routers/credits.router')),
});

export type AppRouter = typeof appRouter;
