import { useQuery } from '@tanstack/react-query';
import { supabase } from '@utils/supabase';

// types
type User = {
	id: string;
};

// Resources
export const getMessages = async ({
	user,
	projectId,
}: {
	user: User;
	projectId: string;
}) => {
	const { data } = await supabase
		.from('isaac_messages')
		.select(`content, type, id`)
		.eq('userId', user?.id)
		.eq('projectId', projectId);
	return data;
};

// Hooks
export const useGetMessages = (user: User, projectId: string) => {
	const queryInfo = useQuery({
		queryKey: ['get-messages', user, projectId],
		queryFn: () => getMessages({ user, projectId }),
		enabled: !!user,
	});

	return queryInfo; // return entire queryInfo, including refetch function
};
