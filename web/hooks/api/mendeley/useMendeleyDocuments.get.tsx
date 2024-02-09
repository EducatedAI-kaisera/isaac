import { useGetUserIntegration } from '@hooks/api/useUserIntegration.get';
import { getMendeleyDocuments } from '@resources/integration/mendeley';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetMendeleyDocuments = (folderId: string) => {
	const { data, isError } = useGetUserIntegration();
	const token = data.mendeley.access_token;

	if (isError) {
		toast.error('Error loading documents');
	}

	return useQuery({
		queryKey: ['get-mendeley-documents', folderId],
		queryFn: () => getMendeleyDocuments({ folderId, token }),
		enabled: !!token && !!folderId,
	});
};
