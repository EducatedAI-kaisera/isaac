import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import useCreateProject from '@hooks/api/useCreateProject';
import { Project } from '@hooks/api/useGetProjects';
import { CornerDownLeft } from 'lucide-react';
import mixpanel from 'mixpanel-browser';
import React, { useState } from 'react';

type CreateProjectInputProps = {
	onSuccess?: (data: Project) => void;
};

const CreateNewProjectInput = ({ onSuccess }: CreateProjectInputProps) => {
	const [projectTitle, setProjectTitle] = useState('');

	// TODO: Refactor this to its own hook
	const { mutateAsync: mutateProject } = useCreateProject({
		createDocumentOnCreate: true,
		onSuccessCb: data => {
			setProjectTitle('');
			onSuccess(data);
		},
	});

	const createProject = e => {
		e.preventDefault();
		if (projectTitle) {
			mutateProject(projectTitle);
			mixpanel.track('Project Created');
		} else {
			alert('Project Name Required');
		}
	};
	return (
		<form className="flex" onSubmit={createProject}>
			<Input
				className="w-full focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0"
				placeholder="Give a name to your project"
				onChange={e => setProjectTitle(e.target.value)}
			/>
			<Button size="icon" variant="ghost" type="submit">
				<CornerDownLeft strokeWidth={1.4} size={16} />
			</Button>
		</form>
	);
};

export default CreateNewProjectInput;
