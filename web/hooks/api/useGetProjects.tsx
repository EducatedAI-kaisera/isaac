import { useUser } from '@context/user';
import { supabase } from '@utils/supabase';
import { useQuery } from '@tanstack/react-query';

export type Project = {
	id: string;
	title: string;
	description: string;
	created_at: string;
	updated_at: string;
	userId: string;
	emoji?: string;
};

// TODO: Configure Supabase to document as foreign key
export const getProjects = async (userId: string) => {
	if (!userId) return [];

	const { data } = await supabase
		.from('projects')
		.select()
		.filter('userId', 'eq', userId)
		.order('sortingOrder', { ascending: true });
	return data as Project[];
};
export const useGetProjects = () => {
	const { user } = useUser();

	return useQuery({
        queryKey: ['get-projects', user?.id],
        queryFn: () => getProjects(user?.id),
        enabled: !!user,
    });
};
