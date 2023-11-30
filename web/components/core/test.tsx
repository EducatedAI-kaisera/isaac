import React from 'react'

type Props = {}

const test = (props: Props) => {
	return (
		<div>
				{projectDocumentsMemo?.length > 0 ? (
				projectDocumentsMemo.map(project => (
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
								size="sm"
								className={clsx(
									'leading-none block pl-3 pr-2 text-sm cursor-pointer rounded-none w-full',
								)}
							>
								<div className="flex justify-left group items-center">
									{(activeProjectId === project.id && (
										<FolderOpen size={15} strokeWidth={1.4} />
									)) || <Folder size={15} strokeWidth={1.4} />}

									<p
										className={clsx(
											'ml-[9px] font-normal line-clamp-1 max-w-[200px]',
											activeProjectId === project.id && 'font-medium ',
										)}
									>
										{project.title}
									</p>

									{isBelowMd ? (
										<EditProjectDropdown
											className={clsx(
												'absolute right-0 w-8',
												activeProjectId === project.id ? 'visible' : 'hidden',
											)}
											projectId={project.id}
											projectName={project.title}
										/>
									) : (
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													id="create-document-button"
													variant="ghost"
													onClick={e => {
														e.stopPropagation();
														setShowCreateDocumentModal(true);
														isBelowMd && openPanel(undefined);
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
									)}
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
									className="flex flex-col gap-px"
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
															isBelowMd && openPanel(undefined);
														}}
														className={clsx(
															'leading-none flex py-2 pr-2 pl-4 text-sm cursor-pointer rounded-md mx-3 hover:bg-accent hover:text-accent-foreground',
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
														<p className="line-clamp-1">{_document.title}</p>
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
				<span className="text-xs text-muted-foreground mb-px h-8 leading-none block p-2  w-full">
					{' '}
					Create your first project{' '}
			)}
		</div>
	)
}

export default test
