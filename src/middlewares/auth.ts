import { auth } from '@/lib/auth/auth'
// import type { User } from '@/schemas/user'
import { ORPCError, os } from '@orpc/server'
import type { User } from 'better-auth/types';
import { headers } from 'next/headers'

export const requiredAuthMiddleware = os
  .$context<{ session?: { user?: User } }>()
  .middleware(async ({ context, next }) => {
    /**
     * Why we should ?? here?
     * Because it can avoid `getSession` being called when unnecessary.
     * {@link https://orpc.unnoq.com/docs/best-practices/dedupe-middleware}
     */
    const session = context.session ?? await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new ORPCError('UNAUTHORIZED')
    }

    return next({
      context: { user: session.user },
    })
  })
