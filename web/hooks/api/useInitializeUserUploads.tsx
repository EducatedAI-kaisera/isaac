import { useLiteratureReferenceStore } from '@context/literatureReference.store';
import { useUser } from '@context/user';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { RealtimePostgresChangesPayload } from '@supabase/realtime-js/src/RealtimeChannel';
import { supabase } from '@utils/supabase';
import { useEffect, useState } from 'react';
import { UploadedFile } from 'types/literatureReference.type';

const getUserUploads = async ({
	userId,
	projectId,
}: {
	userId: string;
	projectId: string;
}) => {
	const { data } = await supabase
		.from('uploads')
		.select('id, status, citation, file_name, created_at, custom_citation')
		.eq('user_id', userId)
		.eq('project_id', projectId)
		.order('created_at', { ascending: false });
	return data as UploadedFile[];
};

// ! Deprecated
const useInitializeUserUploads = (targetProjectId?: string) => {
	const { projectId: pathProjectId } = useGetEditorRouter();
	const setUploads = useLiteratureReferenceStore(s => s.setUserUploads);
	const insertUserUpload = useLiteratureReferenceStore(s => s.insertUserUpload);
	const deleteUserUpload = useLiteratureReferenceStore(s => s.deleteUserUpload);
	const updateUserUpload = useLiteratureReferenceStore(s => s.updateUserUpload);
	const setOpen = useLiteratureReferenceStore(s => s.setShowUploadMetaModal);

	const [error, setError] = useState(null);
	const [status, setStatus] = useState('idle');
	const { user } = useUser();
	const userId = user?.id;

	useEffect(() => {
		const projectId = targetProjectId || pathProjectId;
		if (!userId || !projectId) return;

		const fetchInitialData = async () => {
			setStatus('loading');
			try {
				const data = await getUserUploads({
					userId,
					projectId,
				});
				setUploads(data);
				setStatus('success');
			} catch (error) {
				setError(error);
				setStatus('error');
				console.error(error);
			}
		};

		fetchInitialData();

		const handleRealtimeUpdates = (
			payload: RealtimePostgresChangesPayload<UploadedFile>,
		) => {
			const { eventType, new: newRecord, old: oldRecord } = payload;
			switch (eventType) {
				case 'INSERT':
					insertUserUpload(newRecord);
					break;
				case 'UPDATE':
					if (newRecord.custom_citation.isAutoImport) {
						setOpen({ uploadId: newRecord.id, fileName: newRecord.file_name });
						const currCitation = newRecord.custom_citation;
						currCitation.isAutoImport = false;
						supabase.from('uploads').update({ custom_citation: currCitation });
					}
					updateUserUpload(oldRecord.id, newRecord);
					break;
				case 'DELETE':
					deleteUserUpload(oldRecord.id);
					break;
				default:
					break;
			}
		};

		const subscription = supabase
			.channel('public:uploads')
			.on<UploadedFile>(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'uploads',
					where: { user_id: userId },
				},
				handleRealtimeUpdates,
			)
			.subscribe();

		return () => {
			void supabase.removeChannel(subscription);
		};
	}, [userId, pathProjectId, targetProjectId]);

	return {
		error,
		status,
	};
};

export default useInitializeUserUploads;
