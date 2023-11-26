import CreateNewProjectInput from '@components/core/CreateNewProjectInput';
import ProjectGroup from '@components/ProjectGroup';
import SidebarFooter from '@components/SidebarFooter';
import { Button } from '@components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@components/ui/popover';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@components/ui/tooltip';
import { useUIStore } from '@context/ui.store';
import { useClickOutside } from '@mantine/hooks';
import { useTour } from '@reactour/tour';
import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { memo } from 'react';

const ProjectExplorer = memo(() => {
	const createProjectPopoverOpen = useUIStore(s => s.createProjectPopoverOpen);
	const setCreateProjectPopoverOpen = useUIStore(
		s => s.setCreateProjectPopoverOpen,
	);

	const { push } = useRouter();
	const handleClickOutside = () => setCreateProjectPopoverOpen(false);
	const createProjectRef = useClickOutside(handleClickOutside);
	const { isOpen: tutorialMode, setCurrentStep } = useTour();
	return (
		<nav
			className={clsx(
				'relative z-20 w-full flex flex-col h-full',
				'dark:bg-black bg-white',
			)}
		>
			<div className="flex items-center justify-between p-3">
				<p className="text-sm font-medium text-foreground">Projects</p>
				<Popover open={createProjectPopoverOpen}>
					<Tooltip>
						<TooltipTrigger asChild>
							<PopoverTrigger id="create-project-button" asChild>
								<Button
									size="icon"
									variant="ghost"
									className="w-6 h-6"
									onClick={() => {
										setCreateProjectPopoverOpen(true);
										tutorialMode && setCurrentStep(prev => prev + 1);
									}}
								>
									<Plus size={16} strokeWidth={1.4} />
								</Button>
							</PopoverTrigger>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>Create new project </p>
						</TooltipContent>
					</Tooltip>
					<PopoverContent
						className="p-1"
						ref={createProjectRef}
						id="create-project-input"
					>
						<CreateNewProjectInput
							onSuccess={data => {
								setCreateProjectPopoverOpen(false);
								if (tutorialMode) {
									push(`/editor/${data.id}`);
									setTimeout(() => setCurrentStep(prev => prev + 1), 500);
								}
							}}
						/>
					</PopoverContent>
				</Popover>
			</div>
			<ProjectGroup />
			<SidebarFooter />
		</nav>
	);
});

export default ProjectExplorer;
