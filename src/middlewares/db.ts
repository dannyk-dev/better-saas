// import type db from "@/server/db";
import DB from "@/server/db"
import { os } from "@orpc/server"


export const dbProviderMiddleware = os
  .$context<{ db?: typeof DB }>()
  .middleware(async ({ context, next }) => {
    /**
     * Why we should ?? here?
     * Because it can avoid `createFakeDB` being called when unnecessary.
     * {@link https://orpc.unnoq.com/docs/best-practices/dedupe-middleware}
     */
    const db: typeof DB = context.db ?? DB;

    return next({
      context: {
        db,
      },
    })
  })
