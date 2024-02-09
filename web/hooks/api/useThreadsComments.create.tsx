import { useUser } from '@context/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@utils/supabase';
import mixpanel from 'mixpanel-browser';
import { toast } from 'sonner';
import { DocumentThread, ThreadComment } from 'types/threadComments';
import { v4 as uuidv4 } from 'uuid';

type Payload = Omit<ThreadComment, 'timeStamp' | 'type' | 'id' | 'deleted'> & {
	threadId: string;
	previousComments: ThreadComment[];
};

const createThreadComment = async ({
	threadId,
	content,
	author,
	previousComments,
}: Payload) => {
	const { data } = await supabase
		.from('comments')
		.update({
			comments: [
				...previousComments,
				{
					id: uuidv4(),
					content,
					deleted: false,
					timeStamp: Date.now(),
					type: 'comment',
					author,
				},
			],
		})
		.eq('id', threadId)
		.select()
		.single();

	return data;
};

const useCreateThreadComment = (params?: {
	onSuccessCb?: (thread: DocumentThread) => void;
}) => {
	const { user } = useUser();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: Omit<Payload, 'author'>) => {
			if (user?.username) {
				return createThreadComment({
					...payload,
					author: user?.username,
				});
			}
		},
		mutationKey: ['create-document-thread'],
		onMutate: () => {
			mixpanel.track('Created Document Thread');
		},
		onSuccess: thread => {
			if (params?.onSuccessCb) {
				params.onSuccessCb(thread);
			}

			queryClient.invalidateQueries({
				queryKey: ['get-thread-comment'],
			});
		},
		onError: error => {
			console.log({ error });
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export default useCreateThreadComment;
