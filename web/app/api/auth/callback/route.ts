import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get('code');
	if (code) {
		const cookieStore = cookies();
		const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
		await supabase.auth.exchangeCodeForSession(code);
	}
	return new Response(null, {
			status: 302,
			headers: {
					Location: '/editor'
			}
	})
}
