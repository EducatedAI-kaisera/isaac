import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req, res });
	const { data } = await supabase.auth.getUser();
	if (!data.user) return NextResponse.redirect(new URL('/signup', req.url));
	const result = await supabase
		.from('profile')
		.select('is_subscribed, expiration_date, plan')
		.eq('id', data.user.id)
		.single();
	if (!result.data) return NextResponse.redirect(new URL('/signup', req.url));
	return NextResponse.next();
}

export const config = {
	matcher: ['/editor', '/editor/:path*'],
};
