import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@utils/supabase';
import { toast } from 'sonner';

type CreateNotePayload = {
	projectId: string;
	text: string;
};

export type Note = {
	projectId: string;
	text: string;
	id: string;
	created_at: string;
};

export const createNote = async (newNote: CreateNotePayload) => {
	const { data, error: err } = await supabase
		.from('notes')
		.insert(newNote)
		.select()
		.single();
	if (err) {
		throw err;
	}

	return data as Note;
};

type Callbacks = {
	onSuccess?: (note: Note) => void;
};

export default function useCreateNote(cb?: Callbacks) {
	const { projectId } = useGetEditorRouter();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (text: string) => createNote({ text, projectId }),
		mutationKey: ['create-note'],
		onSuccess: note => {
			queryClient.invalidateQueries({
				queryKey: ['get-notes'],
			});
			toast.success('Note Created!');
			cb?.onSuccess?.(note);
		},
		onError: error => {
			console.log({ error });
			//TODO: need to show a more clearer message
			toast.error('There is something wrong. Please try again.');
		},
	});
}

export const getNotes = async (projectId: string) => {
	const { data, error } = await supabase
		.from('notes')
		.select()
		.order('created_at', { ascending: false })
		.filter('projectId', 'eq', projectId);

	if (error) {
		throw error;
	}

	return data as Note[];
};

export const useGetNotes = (projectId: string) => {
	return useQuery({
		queryKey: ['get-notes', projectId],
		queryFn: () => getNotes(projectId),
		enabled: !!projectId,
	});
};

const deleteNote = async (noteId: string) => {
	const { data } = await supabase
		.from('notes')
		.delete()
		.eq('id', noteId)
		.select();
	return data;
};

export const useDeleteNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteNote,
		mutationKey: ['delete-note'],
		onSuccess: () => {
			toast.success('Note deleted successfully!');
			queryClient.invalidateQueries({
				queryKey: ['get-notes'],
			});
		},
		onError: error => {
			console.log({ error });
			toast.error('There is something wrong. Please try again.');
		},
	});
};

const updateNote = async (payload: { id: string; text: string }) => {
	const { id, text } = payload;
	const { data } = await supabase
		.from('notes')
		.update({ text })
		.eq('id', id)
		.select();
	return data;
};

export const useUpdateNote = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateNote,
		mutationKey: ['update-note'],
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['get-notes'],
			});
		},
		onError: error => {
			console.log({ error });
			//TODO: need to show a more clearer message
			toast.error('There is something wrong. Please try again.');
		},
	});
};
