import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@utils/supabase';
import toast from 'react-hot-toast';
import {
	ReferenceLiterature,
	UploadedFile,
} from 'types/literatureReference.type';
import { Project } from 'types/project';

// types
type User = {
	id: string;
};

type DocumentPayload = {
	id: string;
	content: string;
};

// Resources
export const getDocuments = async ({ user }: { user: User }) => {
	const { data } = await supabase
		.from('documents')
		.select(`text, title, id, projectId`)
		.eq('userId', user?.id);
	return data;
};

export const getProjects = async ({ user }: { user: User }) => {
	const { data } = await supabase
		.from('projects')
		.select()
		.filter('userId', 'eq', user?.id);
	return data as Project[];
};

export const createProject = async ({
	projectTitle,
	user,
}: {
	projectTitle: string;
	user: User;
}) => {
	const { data } = await supabase
		.from('projects')
		.insert([
			{
				title: projectTitle,
				userId: user?.id,
			},
		])
		.select();

	return data;
};

export const createDocument = async ({
	projectId,
	user,
	docTitle,
}: {
	projectId: string;
	user: User;
	docTitle?: string;
}) => {
	const { data } = await supabase
		.from('documents')
		.insert([
			{
				type: 'text_document',
				projectId: projectId,
				title: docTitle || 'Main Document',
				userId: user?.id,
			},
		])
		.select();

	return data;
};

const renameDocument = async ({
	docId,
	newTitle,
}: {
	docId: string;
	newTitle: string;
}) => {
	const { data } = await supabase
		.from('documents')
		.update({ title: newTitle })
		.eq('id', docId)
		.select();

	return data;
};

const deleteDocument = async (docId: string) => {
	const { data } = await supabase
		.from('documents')
		.delete()
		.eq('id', docId)
		.select();

	return data;
};

export const updateDocument = async (document: DocumentPayload) => {
	const { data } = await supabase
		.from('documents')
		.update({ text: document.content })
		.eq('id', document?.id)
		.select();
	return data;
};

const renameProject = async ({
	projectId,
	newTitle,
}: {
	projectId: string;
	newTitle: string;
}) => {
	const { data } = await supabase
		.from('projects')
		.update({ title: newTitle })
		.eq('id', projectId)
		.select();

	return data;
};

const getReference = async (projectId: string) => {
	const { data } = await supabase
		.from('references')
		.select('*')
		.filter('projectId', 'eq', projectId);

	return data as ReferenceLiterature[];
};

const deleteReference = async id => {
	const { data } = await supabase
		.from('references')
		.delete()
		.eq('id', id)
		.select();
	return data;
};

const getUserUploads = async (userId: string, projectId: string) => {
	const { data } = await supabase
		.from('uploads')
		.select('id, status, citation, file_name, created_at, custom_citation')
		.eq('user_id', userId)
		.eq('project_id', projectId)
		.order('created_at', { ascending: false });
	return data as UploadedFile[];
};

// Hooks
export const useGetDocuments = (user: User) => {
	return useQuery({
		queryKey: ['get-documents', user],
		queryFn: () => getDocuments({ user }),
		enabled: !!user,
	});
};

export const useGetProjects = (user: User) => {
	return useQuery({
		queryKey: ['get-projects', user],
		queryFn: () => getProjects({ user }),
		enabled: !!user,
	});
};

export const useCreateProject = ({
	onSuccessCb,
}: {
	onSuccessCb: (project: any[]) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createProject,
		mutationKey: ['create-project'],
		onSuccess: project => {
			onSuccessCb(project);
			toast.success('Project created successfully!');
			queryClient.invalidateQueries({
				queryKey: ['get-projects'],
			});
		},
		onError: error => {
			console.log({ error });
			//TODO: need to show a more clearer message
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export const useCreateDocument = (params?: {
	onSuccessCb?: (document: any[]) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createDocument,
		mutationKey: ['create-document'],
		onSuccess: document => {
			if (params?.onSuccessCb) {
				params.onSuccessCb(document);
			}

			toast.success('Document created successfully!');
			queryClient.invalidateQueries({
				queryKey: ['get-documents'],
			});
			//TODO: need to close model
		},
		onError: error => {
			console.log({ error });
			//TODO: need to show a more clearer message
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export const useRenameDocument = ({
	onSuccessCb,
}: {
	onSuccessCb: () => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: renameDocument,
		mutationKey: ['rename-document'],
		onSuccess: () => {
			onSuccessCb();
			toast.success('Document renamed successfully!');
			queryClient.invalidateQueries({
				queryKey: ['get-documents'],
			});
			queryClient.invalidateQueries({
				queryKey: ['get-document'],
			});
			//TODO: need to close model
		},
		onError: error => {
			console.log({ error });
			//TODO: need to show a more clearer message
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export const useDeleteDocument = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteDocument,
		mutationKey: ['delete-document'],
		onSuccess: () => {
			toast.success('Document deleted successfully!');
			queryClient.invalidateQueries({
				queryKey: ['get-documents'],
			});
			//TODO: need to close model
		},
		onError: error => {
			console.log({ error });
			//TODO: need to show a more clearer message
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export const useRenameProject = ({
	onSuccessCb,
}: {
	onSuccessCb: () => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: renameProject,
		mutationKey: ['rename-project'],
		onSuccess: () => {
			onSuccessCb();
			toast.success('Project renamed successfully!');
			queryClient.invalidateQueries({
				queryKey: ['get-projects'],
			});
			//TODO: need to close model
		},
		onError: error => {
			console.log({ error });
			//TODO: need to show a more clearer message
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export const useUpdateDocument = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateDocument,
		mutationKey: ['update-document'],
		onMutate: data => {
			queryClient.cancelQueries({
				queryKey: ['get-documents', 'get-document'],
			});
		},
		onSuccess: data => {
			queryClient.invalidateQueries({
				queryKey: ['get-documents'],
			});
			queryClient.invalidateQueries({
				queryKey: ['get-document'],
			});
		},
		onError: error => {
			console.log({ error });
			//TODO: need to show a more clearer message
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export const useGetReference = (projectId: string) => {
	return useQuery({
		queryKey: ['get-reference', projectId],
		queryFn: () => getReference(projectId),
		enabled: !!projectId,
	});
};

export const useGetUserUploads = (userId: string, projectId: string) => {
	return useQuery({
		queryKey: ['get-user-uploads', userId, projectId],
		queryFn: () => getUserUploads(userId, projectId),
		enabled: !!userId && !!projectId,
	});
};

export const useDeleteReference = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteReference,
		mutationKey: ['delete-reference'],
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['get-reference'],
			});
			toast.success('Reference removed');
		},
		onError: error => {
			console.log({ error });
			//TODO: need to show a more clearer message
			toast.error('There is something wrong. Please try again.');
		},
	});
};
