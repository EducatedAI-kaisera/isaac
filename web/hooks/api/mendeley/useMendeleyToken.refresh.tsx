import { useUser } from '@context/user';
import {
	refreshMendeleyToken,
	saveMendeleyToken,
} from '@resources/integration/mendeley';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useRefreshMendeleyToken = (params?: { onSuccessCb?: () => void }) => {
	const { user } = useUser();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (refreshToken: string) => {
			return refreshMendeleyToken(refreshToken);
		},
		onSuccess: async data => {
			if (data.status === 200 || data.status === 201) {
				const { status } = await saveMendeleyToken(user?.id, data.data);
				if (status === 200) {
					queryClient.invalidateQueries({
						queryKey: ['get-user-integration'],
					});
					console.log('mendeley token refreshed');
				}
			}
			params?.onSuccessCb?.();
		},
		onError: error => {
			console.log({ error });
		},
	});
};

export default useRefreshMendeleyToken;
