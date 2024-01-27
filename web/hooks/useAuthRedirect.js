import { supabase } from '@utils/supabase';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';

const useAuthRedirect = () => {
	const router = useRouter();

	const redirectUser = useCallback(async () => {
		const { data } = await supabase.auth.getUser();
		if (!data.user) {
			await router.push('/signup');
			// FIXME: What is this additional router.push for?
			setTimeout(() => {
				router.push('/signup');
			}, 1000); // 5000 milliseconds = 5 seconds
			return;
		}

		supabase
			.from('profile')
			.select('is_subscribed, expiration_date, plan')
			.eq('id', data.user.id)
			.single()
			.then(result => {
				// If user isn't logged in (no profile data), redirect to signup page
				if (!result.data) {
					setTimeout(() => {
						router.push('/signup');
					}, 1000); // 5000 milliseconds = 5 seconds
				}
			});
	}, [router]);

	useEffect(() => {
		void redirectUser();
	}, [redirectUser, router.pathname]);
};

export default useAuthRedirect;
