import { useUser } from '@context/user';
import { getUserStorageSize } from '@resources/user';
import { supabase } from '@utils/supabase';
import { useQuery } from '@tanstack/react-query';

export const QKFreeAIToken = 'get-free-ai-token';
export const QKUploadStorageUsage = 'get';

export const getUserDailyFreeToken = async (userId: string) => {
	const { data: user } = await supabase
		.from('profile')
		.select('daily_free_token')
		.eq('id', userId)
		.single();

	return user?.daily_free_token as number;
};

export const useGetFreeTokenUsage = () => {
	const { user } = useUser();
	return useQuery({
        queryKey: [QKFreeAIToken, user?.id],
        queryFn: () => getUserDailyFreeToken(user?.id),
        enabled: !!user?.id && user?.is_subscribed === false,
    });
};

export const useGetUploadStorageUsage = () => {
	const { user } = useUser();
	return useQuery({
		queryKey: [QKUploadStorageUsage],
		queryFn: () => getUserStorageSize(user?.id),
		enabled: !!user?.id && user?.is_subscribed === false,
	});
};
