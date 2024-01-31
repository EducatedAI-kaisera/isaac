import { useQuery } from '@tanstack/react-query';
import { supabase } from '@utils/supabase';
import { ChatMessageV2 } from 'types/chat';

export const retrieveChatMessages = async (sessionId: string) => {
	const { data } = await supabase
		.from('chat_messages')
		.select('*')
		.filter('session_id', 'eq', sessionId)
		.order('created_at', { ascending: true });

	return data as ChatMessageV2[];
};

// NOT USED
export const useRetrieveChatMessages = (sessionId?: string) => {
	return useQuery({
		queryKey: ['get-chat-messages', sessionId],
		queryFn: () => retrieveChatMessages(sessionId),
		enabled: !!sessionId,
	});
};
