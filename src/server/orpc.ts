import { requiredAuthMiddleware } from "@/middlewares/auth";
import { dbProviderMiddleware } from "@/middlewares/db";
import { os } from "@orpc/server";

export const pub = os.use(dbProviderMiddleware);

export const authed = pub.use(requiredAuthMiddleware);
