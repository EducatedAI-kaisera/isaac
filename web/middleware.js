import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(request) {
	// Create a Supabase client configured to use cookies
	const supabase = createMiddlewareClient({ req, res });
	const { data } = await supabase.auth.getUser();
	if (!data.user) {
		return NextResponse.redirect(new URL('/signup', request.url));
	}
	const result = await supabase
		.from('profile')
		.select('is_subscribed, expiration_date, plan')
		.eq('id', data.user.id)
		.single();
	// If user isn't logged in (no profile data), redirect to signup page
	if (!result.data) {
		return NextResponse.redirect(new URL('/signup', request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: ['/editor', '/editor/:path*'],
};
