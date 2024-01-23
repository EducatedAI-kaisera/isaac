import { supabase } from '@utils/supabase';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useAuthRedirect = () => {
	const router = useRouter();

	useEffect(() => {
		const user = supabase.auth.user();

		if (!user) {
			setTimeout(() => {
				router.push('/signup');
			}, 1000); // 5000 milliseconds = 5 seconds
			return;
		}

		supabase
			.from('profile')
			.select('is_subscribed, expiration_date, plan')
			.eq('id', user.id)
			.single()
			.then(result => {
				// If user isn't logged in (no profile data), redirect to signup page
				if (!result.data) {
					setTimeout(() => {
						router.push('/signup');
					}, 1000); // 5000 milliseconds = 5 seconds
				}
			});
	}, [router.pathname]);
};

export default useAuthRedirect;
