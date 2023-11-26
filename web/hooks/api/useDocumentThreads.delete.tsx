import { useMutation, useQuery, useQueryClient } from 'react-query';
import { supabase } from '@utils/supabase';
import toast from 'react-hot-toast';
import { TextDocument } from '@hooks/api/useGetDocuments';
import { $getNodeByKey, LexicalEditor, LexicalNode } from 'lexical';
import { $isMarkNode, $unwrapMarkNode } from '@lexical/mark';

type Payload = {
  threadId: string;
  markNodeKey: string;
};

const deleteDocumentThead = async ({ threadId }: Payload) => {
  const { data } = await supabase
    .from('comments')
    .delete()
    .eq('id', threadId)
    .single();

  return data;
};

const useDeleteCommentThread = (editor: LexicalEditor) => {
  const queryClient = useQueryClient();
  return useMutation(deleteDocumentThead, {
    mutationKey: 'delete-document',
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

      queryClient.invalidateQueries(['get-thread-comment']);
    },
    onError: error => {
      console.log({ error });
      toast.error('There is something wrong. Please try again.');
    },
  });
};

export default useDeleteCommentThread;
