import { useUser } from '@context/user';
import { supabase } from '@utils/supabase';
import { useQuery } from '@tanstack/react-query';
import { UserIntegration } from 'types/integration';

export const getUserIntegration = async (userId: string) => {
	const { data, error } = await supabase
		.from('user_integrations')
		.select('*')
		.eq('id', userId);

	if (data.length === 0) {
		return null;
	}
	return data[0] as UserIntegration;
};

export const useGetUserIntegration = () => {
	const { user } = useUser();
	const userId = user?.id;
	return useQuery({
        queryKey: ['get-user-integration', userId],
        queryFn: () => getUserIntegration(userId),
        enabled: !!userId
    });
};
