import { CookieOptions, createServerClient } from '@supabase/ssr';
import { serialize } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';

export default function getSupabaseServerClient(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.NEXT_PUBLIC_SUPABASE_KEY,
		{
			cookies: {
				get(name: string) {
					return req.cookies[name];
				},
				set(name: string, value: string, options: CookieOptions) {
					res.setHeader('Set-Cookie', serialize(name, value, options));
				},
				remove(name: string, options: CookieOptions) {
					res.setHeader('Set-Cookie', serialize(name, '', options));
				},
			},
		},
	);
}
