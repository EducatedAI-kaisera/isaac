import { useGetUserIntegration } from '@hooks/api/useUserIntegration.get';
import { getZoteroFolders } from '@resources/integration/zotero';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetZoteroCollection = () => {
	const { data, isError } = useGetUserIntegration();

	if (isError) {
		toast.error("Error loading user's zotero collections");
	}
	return useQuery({
		queryKey: ['get-zotero-folders'],
		queryFn: () => getZoteroFolders(data.zotero),
		enabled: !!data?.zotero,
	});
};
