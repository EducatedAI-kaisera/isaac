import EditDocumentContextMenu from '@components/core/EditDocumentContextMenu';
import EditProjectContextMenu from '@components/core/EditProjectContextMenu';
import DocumentTableOfContent from '@components/DocumentTableOfContent';

import { Button } from '@components/ui/button';
import { ScrollArea } from '@components/ui/scroll-area';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@components/ui/tooltip';
import { useUIStore } from '@context/ui.store';
// import data, { Emoji } from '@emoji-mart/data';
import useGetProjectWithDocuments from '@hooks/api/useGetProjectWithDocuments';
import useDocumentTabs, { TabType } from '@hooks/useDocumentTabs';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { useTour } from '@reactour/tour';
import { isDocumentEmpty } from '@utils/misc';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { File, FileText, Folder, FolderOpen, Plus } from 'lucide-react';
import { useRouter } from 'next/router';
import React from 'react';

// Animation variants for the project folders
const folderVariants = {
	open: {
		height: 'auto',
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: 'easeInOut',
			staggerChildren: 0.1, // delay between each child animation
		},
	},
	closed: {
		height: 0,
		opacity: 0,
		transition: {
			duration: 0.3,
			ease: 'easeInOut',
		},
	},
};

const documentVariants = {
	open: {
		opacity: 1,
		transition: {
			duration: 0.3,
		},
	},
	closed: {
		opacity: 0,
		transition: {
			duration: 0.3,
		},
	},
};

const ProjectGroup = () => {
	const { push } = useRouter();
	const { isOpen: tutorialMode, setCurrentStep, currentStep } = useTour();
	const { projectId: activeProjectId } = useGetEditorRouter();
	const { openDocument, activeDocument } = useDocumentTabs();
	const { projectDocuments } = useGetProjectWithDocuments();

	const setShowCreateDocumentModal = useUIStore(
		s => s.setShowCreateDocumentModal,
	);

	// const [isDragging, setIsDraging] = useState(false);
	const isDragging = false;

	const openProject = (projectId: string) => {
		push(`/editor/${projectId}`);
	};

	return (
		<ScrollArea
			id="all-projects"
			className="flex-1 flex-grow h-[30vh] md:h-[45vh] lg:max-h-[80vh] flex flex-col gap-1"
		>
			{projectDocuments?.length > 0 ? (
				projectDocuments.map(project => (
					<div key={project.id} className="w-full">
						<EditProjectContextMenu
							projectId={project.id}
							projectName={project.title}
						>
							<Button
								onClick={() => {
									openProject(project.id);
								}}
								variant="ghost"
								className={clsx(
									`mb-px leading-none block pl-3 pr-2 text-sm cursor-pointer rounded-none w-full`,
								)}
							>
								<div className="flex justify-left group items-center">
									{(activeProjectId === project.id && (
										<FolderOpen size={15} strokeWidth={1.4} />
									)) || <Folder size={15} strokeWidth={1.4} />}

									<p
										className={clsx(
											'ml-[9px] font-normal truncate max-w-[200px]',
											activeProjectId === project.id && 'font-medium ',
										)}
									>
										{project.title}
									</p>

									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												id="create-document-button"
												variant="ghost"
												onClick={e => {
													e.stopPropagation();
													setShowCreateDocumentModal(true);
													setTimeout(
														() => setCurrentStep(prev => prev + 1),
														500,
													);
												}}
												className={clsx(
													activeProjectId === project.id ||
														(tutorialMode && currentStep === 4)
														? 'visible'
														: 'invisible',
													'group-hover:visible hover:bg-muted absolute right-0',
												)}
											>
												<Plus size={14} strokeWidth={1.4} />
											</Button>
										</TooltipTrigger>
										<TooltipContent side="right">
											<p>Create new document</p>
										</TooltipContent>
									</Tooltip>
								</div>
							</Button>
						</EditProjectContextMenu>

						<AnimatePresence>
							{!isDragging && activeProjectId === project.id && (
								<motion.div
									id={`created-documents`}
									variants={folderVariants}
									initial="closed"
									exit="closed"
									animate={activeProjectId === project.id ? 'open' : 'closed'}
									className="flex flex-col gap-px my-0.5"
								>
									<div>
										{project.documents?.map(_document => {
											const isActiveDoc =
												_document.id === activeDocument?.source;
											return (
												<EditDocumentContextMenu
													documentName={_document.title}
													documentId={_document.id}
													key={_document.id}
												>
													<motion.div
														variants={documentVariants}
														initial="closed"
														exit="closed"
														animate={
															activeProjectId === project.id ? 'open' : 'closed'
														}
														onClick={() => {
															openProject(project.id);
															openDocument({
																source: _document.id,
																label: _document.title,
																type: TabType.Document,
																_projectId: project.id,
															});
														}}
														className={clsx(
															`leading-none flex py-2 pr-2 pl-8 text-sm cursor-pointer rounded-md mx-3 my-0.5 hover:bg-accent hover:text-accent-foreground`,
															isActiveDoc && 'text-isaac',
														)}
													>
														{isDocumentEmpty(_document.text) ? (
															<File
																strokeWidth={1.4}
																className="mr-[9px]"
																size={14}
															/>
														) : (
															<FileText
																strokeWidth={1.4}
																className="mr-[9px]"
																size={14}
															/>
														)}
														<p className="truncate max-w-[200px]">
															{_document.title}
														</p>
													</motion.div>
													{isActiveDoc && <DocumentTableOfContent />}
												</EditDocumentContextMenu>
											);
										})}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				))
			) : (
				<span className="text-xs text-muted-foreground mb-px h-8 leading-none block p-2 text-smw-full">
					{' '}
					No projects yet{' '}
				</span>
			)}
		</ScrollArea>
	);
};

export default React.memo(ProjectGroup);
