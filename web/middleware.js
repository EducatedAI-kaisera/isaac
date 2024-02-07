import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient(
		{ req, res },
		{
			supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_KEY,
			supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
		},
	);
	const { data } = await supabase.auth.getUser();
	if (!data.user) return NextResponse.redirect(new URL('/signup', req.url));
	return NextResponse.next();
}

export const config = {
	matcher: ['/editor', '/editor/:path*'],
};
