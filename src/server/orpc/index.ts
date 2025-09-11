import authRouter from '@/server/orpc/routers/auth.router';
import { lazy, os, unlazyRouter } from '@orpc/server';

const appRouter = os.router({
  auth: lazy(() => import('@/server/orpc/routers/auth.router')),
});


export type AppRouter = typeof appRouter;
