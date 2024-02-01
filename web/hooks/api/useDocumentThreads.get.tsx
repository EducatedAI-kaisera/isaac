import useDocumentTabs from '@hooks/useDocumentTabs';
import { supabase } from '@utils/supabase';
import { useQuery } from '@tanstack/react-query';
import { DocumentThread } from 'types/threadComments';

export const getDocumentCommentThreads = async (documentId: string) => {
	const { data } = await supabase
		.from('comments')
		.select()
		.filter('documentId', 'eq', documentId);

	return data as DocumentThread[];
};

export const useGetDocumentCommentThreads = (_documentId?: string) => {
	const { activeDocument } = useDocumentTabs();
	const documentId = _documentId || activeDocument?.source;

	return useQuery({
        queryKey: ['get-thread-comment', documentId],
        queryFn: () => getDocumentCommentThreads(documentId),
        enabled: !!documentId
    });
};
