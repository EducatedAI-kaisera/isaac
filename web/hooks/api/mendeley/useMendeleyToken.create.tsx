import { useUser } from '@context/user';
import {
	createMendeleyToken,
	saveMendeleyToken,
} from '@resources/integration/mendeley';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useCreateMendeleyToken = (params?: { onSuccessCb?: () => void }) => {
	const { user } = useUser();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (authorizationCode: string) => {
			return createMendeleyToken(authorizationCode);
		},
		onSuccess: async data => {
			if (data.status === 200 || data.status === 201) {
				const { status } = await saveMendeleyToken(user?.id, data.data);
				if (status === 200) {
					queryClient.invalidateQueries({
						queryKey: ['get-user-integration'],
					});
				}
			}
			params?.onSuccessCb?.();
		},
		onError: error => {
			console.log({ error });
		},
	});
};

export default useCreateMendeleyToken;
