import { useUser } from '@context/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@utils/supabase';
import mixpanel from 'mixpanel-browser';
import { toast } from 'sonner';
import { DocumentThread } from 'types/threadComments';
import { v4 as uuidv4 } from 'uuid';

type Payload = {
	id: string;
	quote: string;
	documentId: string;
	comment: string;
	author: string;
};

const createDocumentThread = async ({
	id,
	quote,
	documentId,
	comment,
	author,
}: Payload) => {
	const { data } = await supabase
		.from('comments')
		.insert([
			{
				id,
				quote,
				type: 'thread',
				documentId,
				comments: [
					{
						id: uuidv4(),
						deleted: false,
						content: comment,
						timeStamp: Date.now(),
						type: 'comment',
						author,
					},
				],
			},
		])
		.select()
		.single();

	return data;
};

const useCreateDocumentThread = (params?: {
	onSuccessCb?: (thread: DocumentThread) => void;
}) => {
	const { user } = useUser();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: Omit<Payload, 'author'>) => {
			if (user?.username) {
				return createDocumentThread({
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

export default useCreateDocumentThread;
