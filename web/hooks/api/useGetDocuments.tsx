import { useUser } from '@context/user';
import { supabase } from '@utils/supabase';
import { useQuery } from '@tanstack/react-query';

export type TextDocument = {
	id: string;
	title: string;
	text: string;
	created_at: string;
	projectId: string;
};

const getDocuments = async (userId: string) => {
	const { data } = await supabase
		.from('documents')
		.select(`text, title, id, projectId, created_at`)
		.eq('userId', userId)
		.order('title', { ascending: true });

	return data as TextDocument[];
};

export const useGetDocuments = () => {
	const { user } = useUser();
	const userId = user?.id;

	return useQuery({
		queryKey: ['get-documents', userId],
		queryFn: () => getDocuments(userId),
		enabled: !!userId
	});
};
