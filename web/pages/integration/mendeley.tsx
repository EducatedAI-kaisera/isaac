import { useUser } from '@context/user';
import useGetMendeleyToken from '@hooks/api/mendeley/useMendeleyToken.create';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

// TODO: THIS CAN BE HANDLED ENTIRELY ON BACKEND -> SEE ZOTERO AUTH API
const MendeleyIntegration = () => {
	const { query, push } = useRouter();
	const { code, state } = query;
	const { user } = useUser();

	const { mutateAsync, isPending } = useGetMendeleyToken({
		onSuccessCb: () => {
			toast.success('Mendeley integrated successfully 🎉');
			setTimeout(() => {
				push(state ? `/editor/${state}` : '/editor');
			}, 2000);
		},
	});

	useEffect(() => {
		if (code && user) {
			mutateAsync(code as string);
		}
	}, [code, user]);

	return (
		<div className="justify-center m-5">
			<p>Integrating Mendeley to Isaac...</p>
			{!isPending && (
				<Link href={state ? `/editor/${state}` : '/editor'}>
					Back to Editor
				</Link>
			)}
		</div>
	);
};

export default MendeleyIntegration;
