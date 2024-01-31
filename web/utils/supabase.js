import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_KEY,
);
export const getServiceSupabase = () =>
	createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.SUPABASE_SERVICE_KEY,
	);
