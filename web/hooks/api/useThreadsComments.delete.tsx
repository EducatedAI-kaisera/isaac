import { supabase } from '@utils/supabase';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ThreadComment } from 'types/threadComments';

type Payload = {
	comments: ThreadComment[];
	threadId: string;
	toDeleteId: string;
};

const deleteThreadComment = async ({
	threadId,
	comments,
	toDeleteId,
}: Payload) => {
	const updatedComments = comments.filter(comment => comment.id !== toDeleteId);

	const { data } = await supabase
		.from('comments')
		.update({ comments: updatedComments })
		.eq('id', threadId)
		.select()
		.single();

	return data;
};

const useDeleteThreadComment = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteThreadComment,
		mutationKey: ['delete-document'],
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['get-thread-comment']
			});
		},
		onError: error => {
			console.log({ error });
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export default useDeleteThreadComment;
