import { env } from '@/env';
import db from '@/server/db';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin as adminPlugin, apiKey, organization } from 'better-auth/plugins';

import { createAuthMiddleware } from 'better-auth/api';
import { Resend } from 'resend';

const FEATURE_ORGS = true;
const FEATURE_TEAMS = false;
const FEATURE_ADMIN_RBAC = false;
const FEATURE_API_KEYS = true;
const FEATURE_EMAIL_VERIF = false;

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail(params: { to: string; subject: string; html?: string; text?: string }) {
	if (!resend) return;
	await resend.emails.send({
		from: env.RESEND_FROM ?? 'noreply@yourapp.dev',
		to: params.to,
		subject: params.subject,
		html: params.html ?? `<pre>${params.text ?? ''}</pre>`,
		text: params.text,
	});
}

const baseURL = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export const auth = betterAuth({
	baseURL,
	database: drizzleAdapter(db, { provider: 'pg' }),

	emailAndPassword: {
		enabled: true,
		...(FEATURE_EMAIL_VERIF
			? {
					requireEmailVerification: true,
					async sendResetPassword({ user, url }) {
						await sendEmail({
							to: user.email,
							subject: 'Reset your password',
							text: `Reset your password: ${url}`,
						});
					},
			  }
			: {}),
	},

	socialProviders: {
		github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
		google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
	},

	session: {
		expiresIn: 60 * 60 * 24 * 30,
		updateAge: 60 * 60 * 24 * 3,
		cookieCache: { enabled: true, maxAge: 60 * 60 },
	},

	...(FEATURE_EMAIL_VERIF
		? {
				emailVerification: {
					sendOnSignUp: true,
					async sendVerificationEmail({ user, url }) {
						await sendEmail({
							to: user.email,
							subject: 'Verify your email',
							text: `Verify your email: ${url}`,
						});
					},
				},
		  }
		: {}),

	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path === '/organization/create-invitation' && FEATURE_ORGS) {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const returned: any = ctx.context.returned;

				const invite = returned?.data ?? returned;
				if (invite?.email && invite?.id) {
					const acceptUrl = `${baseURL}/accept-invite?id=${encodeURIComponent(invite.id)}`;
					await sendEmail({
						to: invite.email,
						subject: `You're invited to join ${invite.organization?.name ?? 'an organization'}`,
						html: `
              <h3>Invitation</h3>
              <p>You’ve been invited to join <b>${invite.organization?.name ?? 'our workspace'}</b>.</p>
              <p><a href="${acceptUrl}">Accept invitation</a></p>
            `,
						text: `Accept invitation: ${acceptUrl}`,
					});
				}
			}
		}),
	},

	plugins: [
		...(FEATURE_ADMIN_RBAC
			? [
					adminPlugin({
						defaultRole: 'member',
						roles: {},
					}),
			  ]
			: []),

		...(FEATURE_API_KEYS ? [apiKey()] : []),

		...(FEATURE_ORGS
			? [
					organization({
						...(FEATURE_TEAMS ? { teams: { enabled: true } } : {}),

						// ...(FEATURE_DYNAMIC_ROLES ? { roles: { allowDynamic: true } } : {}),
					}),
			  ]
			: []),
	],
});
