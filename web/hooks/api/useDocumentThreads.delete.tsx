import { TextDocument } from '@hooks/api/useGetDocuments';
import { $isMarkNode, $unwrapMarkNode } from '@lexical/mark';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@utils/supabase';
import { $getNodeByKey, LexicalEditor, LexicalNode } from 'lexical';
import { toast } from 'sonner';

type Payload = {
	threadId: string;
	markNodeKey: string;
};

const deleteDocumentThead = async ({ threadId }: Payload) => {
	const { data } = await supabase
		.from('comments')
		.delete()
		.eq('id', threadId)
		.select()
		.single();

	return data;
};

const useDeleteCommentThread = (editor: LexicalEditor) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteDocumentThead,
		mutationKey: ['delete-document'],
		onSuccess: (data: TextDocument, { markNodeKey, threadId }) => {
			editor.update(() => {
				const node = $getNodeByKey(markNodeKey);
				console.log({ node, isMark: $isMarkNode(node) });
				if ($isMarkNode(node)) {
					node.deleteID(threadId);
					if (node.getIDs().length === 0) {
						$unwrapMarkNode(node);
					}
				}
			});

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

export default useDeleteCommentThread;
