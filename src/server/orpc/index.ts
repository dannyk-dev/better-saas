import { lazy, os } from '@orpc/server';

export const appRouter = os.router({
  auth: lazy(() => import('@/server/orpc/routers/auth.router')),
});

export type AppRouter = typeof appRouter;
