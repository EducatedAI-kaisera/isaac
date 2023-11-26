import { supabase } from '@utils/supabase';
import mixpanel from 'mixpanel-browser';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
import { ChatSession } from 'types/chat';

const deleteChatSession = async ({ sessionId }: { sessionId: string }) => {
	const { data } = await supabase
		.from('chat_sessions')
		.delete()
		.eq('id', sessionId)
		.single();

	return data;
};

const useDeleteChatSession = (params?: {
	onSuccessCb?: (chatSession: ChatSession) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation(deleteChatSession, {
		mutationKey: 'delete-chat-session',
		onMutate: () => {
			mixpanel.track('Deleted Chat Session');
		},
		onSuccess: chatSession => {
			if (params?.onSuccessCb) {
				params.onSuccessCb(chatSession);
			}
			toast.success('Chat session deleted!');
			queryClient.invalidateQueries(['get-chat-sessions']);
		},
		onError: error => {
			console.log({ error });
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export default useDeleteChatSession;
