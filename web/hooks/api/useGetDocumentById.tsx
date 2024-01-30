import { supabase } from '@utils/supabase';
import { useQuery } from '@tanstack/react-query';
import { TextDocument } from '@hooks/api/useGetDocuments';

// Resources
export const getDocumentById = async ({
	documentId,
}: {
	documentId: string;
}) => {
	const { data } = await supabase
		.from('documents')
		.select(`text, title, id, projectId`)
		.eq('id', documentId)
		.single();
	return data as TextDocument;
};

export const useGetDocumentById = (documentId: string) => {
	return useQuery({
        queryKey: ['get-document', documentId],
        queryFn: () => getDocumentById({ documentId }),
        enabled: !!documentId
    });
};
