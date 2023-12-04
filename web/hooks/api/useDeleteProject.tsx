import { Project } from '@hooks/api/useGetProjects';
import useDocumentTabs from '@hooks/useDocumentTabs';
import { supabase } from '@utils/supabase';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const deleteProject = async (projectId: string) => {
	const { data } = await supabase
		.from('projects')
		.delete()
		.eq('id', projectId)
		.single();

	return data;
};

const useDeleteProject = () => {
	const queryClient = useQueryClient();
	const { deleteProject: deleteProjectFromTab } = useDocumentTabs();
	return useMutation(deleteProject, {
		mutationKey: 'delete-project',
		onSuccess: (project: Project) => {
			toast.success('Project deleted successfully!');
			queryClient.invalidateQueries(['get-projects']);
			deleteProjectFromTab(project.id);

			// TODO: Redirect if the current project
		},
		onError: error => {
			console.log({ error });
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export default useDeleteProject;
