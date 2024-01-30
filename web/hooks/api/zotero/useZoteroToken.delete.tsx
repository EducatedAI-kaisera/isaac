import { supabase } from '@utils/supabase';

import { useUser } from '@context/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const deleteZoteroToken = async (userId: string) => {
	const { error, status } = await supabase
		.from('user_integrations')
		.update([
			{
				zotero: null,
			},
		])
		.eq('id', userId)
		.select();

	return { error, status };
};

const useRevokeZoteroToken = (params?: { onSuccessCb?: () => void }) => {
	const { user } = useUser();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => {
			return deleteZoteroToken(user?.id);
		},
		onSuccess: async () => {
			queryClient.invalidateQueries({
				queryKey: ['get-user-integration'],
			});
			params?.onSuccessCb?.();
			toast.success('Zotero Integration Revoked');
		},
		onError: error => {
			console.log({ error });
		},
	});
};

export default useRevokeZoteroToken;
