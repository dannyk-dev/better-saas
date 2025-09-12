import { createActionableClient, type RouterClient } from '@orpc/server';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createRouterUtils } from '@orpc/tanstack-query';
import { BatchLinkPlugin } from '@orpc/client/plugins';
import  {appRouter, type AppRouter}  from '@/server/orpc/index';

/**
 * This is part of the Optimize SSR setup.
 *
 * @see {@link https://orpc.unnoq.com/docs/adapters/next#optimize-ssr}
 */
declare global {
	var $client: RouterClient<AppRouter> | undefined;
}

const link = new RPCLink({
	url: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/rpc`,
	plugins: [
		new BatchLinkPlugin({
			groups: [
				{
					condition: () => true,
					context: {},
				},
			],
		}),
	],
});

export const client: RouterClient<AppRouter> = globalThis.$client ?? createORPCClient(link);

export const orpc = createRouterUtils(client);
