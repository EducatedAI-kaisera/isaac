import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get('code');
	if (code) {
		const cookieStore = cookies();
		const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			redirect('/editor');
		}
	}
}
