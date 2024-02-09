import { getMendeleyFolders } from '@resources/integration/mendeley';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetMendeleyFolders = (token?: string) => {
	return useQuery({
		queryKey: ['get-mendeley-folders'],
		queryFn: () => getMendeleyFolders(token),
		enabled: !!token,
	});
};
