import { useUser } from '@context/user';
import { supabase } from '@utils/supabase';
import { useEffect, useState } from 'react';

const UPLOAD_LIFE_TIME_SECONDS = 60 * 60;
type Storage = 'user-uploads' | 'document-image';

const useGetSupabaseSignedUrl = (
	uploadId: string,
	storage: Storage = 'user-uploads',
) => {
	const { user } = useUser();
	const [signedUrl, setSignedUrl] = useState<string | null>(null);
	const [error, setError] = useState(null);
	const [status, setStatus] = useState('idle');

	useEffect(() => {
		if (!user || !uploadId) return;

		const fetchInitialData = async () => {
			setStatus('loading');
			try {
				const { data, error } = await supabase.storage
					.from(storage)
					.createSignedUrl(`${user?.id}/${uploadId}`, UPLOAD_LIFE_TIME_SECONDS);

				if (error) throw error;

				setSignedUrl(data.signedUrl);
				setStatus('success');
			} catch (error) {
				setError(error);
				setStatus('error');
				console.error(error);
			}
		};

		fetchInitialData();
	}, [user, uploadId]);

	return {
		data: signedUrl,
		error,
		status,
	};
};

export default useGetSupabaseSignedUrl;
