import { useUser } from '@context/user';
import { deleteMendeleyToken } from '@resources/integration/mendeley';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const useRevokeMendeleyToken = (params?: { onSuccessCb?: () => void }) => {
	const { user } = useUser();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => {
			return deleteMendeleyToken(user.id);
		},
		onSuccess: async data => {
			queryClient.invalidateQueries({
				queryKey: ['get-user-integration'],
			});
			params?.onSuccessCb?.();
			toast.success('Mendeley Integration Revoked');
		},
		onError: error => {
			console.log({ error });
		},
	});
};

export default useRevokeMendeleyToken;
