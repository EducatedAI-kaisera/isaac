import { useMutation, useQuery, useQueryClient } from 'react-query';
import { supabase } from '@utils/supabase';
import toast from 'react-hot-toast';
import useDocumentTabs from '@hooks/useDocumentTabs';
import { TextDocument } from '@hooks/api/useGetDocuments';

const deleteDocument = async (docId: string) => {
  const { data } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId)
    .single();

  return data;
};

const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { closeTab, activeDocument } = useDocumentTabs();
  return useMutation(deleteDocument, {
    mutationKey: 'delete-document',
    onSuccess: (data: TextDocument) => {
      toast.success('Document deleted successfully!');
      queryClient.invalidateQueries(['get-documents']);

      // Close tab if opened
      if (
        activeDocument.type === 'Document' &&
        activeDocument.source === data.id
      ) {
        closeTab(data.id);
      }

      //TODO: need to close model
    },
    onError: error => {
      console.log({ error });
      //TODO: need to show a more clearer message
      toast.error('There is something wrong. Please try again.');
    },
  });
};

export default useDeleteDocument;
