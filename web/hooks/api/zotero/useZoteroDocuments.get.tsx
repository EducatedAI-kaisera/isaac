import { useGetUserIntegration } from '@hooks/api/useUserIntegration.get';
import { getZoteroDocuments } from '@resources/integration/zotero';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetZoteroDocuments = (folderId: string) => {
	const { data, isError } = useGetUserIntegration();
	const zoteroAccessObj = data?.zotero;

	if (isError) {
		toast.error('Error loading documents');
	}

	return useQuery({
		queryKey: ['get-zotero-documents', folderId],
		queryFn: () => getZoteroDocuments({ folderId, ...zoteroAccessObj }),
		enabled: !!zoteroAccessObj && !!folderId,
	});
};
