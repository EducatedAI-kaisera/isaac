import {
	createPagesBrowserClient,
	createPagesServerClient,
} from '@supabase/auth-helpers-nextjs';

export const supabase = createPagesBrowserClient({
	supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
	supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_KEY,
});

export const getServiceSupabase = () =>
	createPagesBrowserClient({
		supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
		supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_KEY,
	});

export const createSupabaseServerClient = (req, res) => {
	return createPagesServerClient(
		{ req, res },
		{
			supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
			supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_KEY,
		},
	);
};
