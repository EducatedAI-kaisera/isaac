import { supabase } from '@utils/supabase';
import { freePlanLimits } from 'data/pricingPlans';


export const updateTokenUsageForFreeTier = async (userId: string) => {
	const { data: user } = await supabase
		.from('profile')
		.select('*')
		.eq('id', userId)
		.single();

	if (!user) {
		throw new Error('user profile not found');
	}
	if (!user.is_subscribed) {
		if (user.daily_free_token >= freePlanLimits.dailyFreeToken) {
			throw new Error('OUT_OF_TOKEN');
		}
		await supabase
			.from('profile')
			.update({ daily_free_token: user.daily_free_token + 1 })
			.eq('id', userId);
	}

	return user;
};
