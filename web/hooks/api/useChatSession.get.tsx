import { supabase } from '@utils/supabase';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';
import { ChatSession } from 'types/chat';

const getChatSession = async (projectId: string) => {
	const { data } = await supabase
		.from('chat_sessions')
		.select('*')
		.eq('project_id', projectId)
		.order('created_at');

	return data as ChatSession[];
};

const useGetChatSessions = (projectId: string) => {
	return useQuery({
		queryKey: ['get-chat-sessions', projectId],
		queryFn: () => getChatSession(projectId),
		enabled: !!projectId,
		onError: error => {
			console.log({ error });

			//TODO: need to show a more clearer message
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export default useGetChatSessions;
