import { Logomark } from '@components/landing/Logo';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Input } from '@components/ui/input';
import InputSettingButton from '@components/ui/input-setting-button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@components/ui/popover';
import useChatStore from '@context/chat.store';
import { useUIStore } from '@context/ui.store';
import { useUser } from '@context/user';
import useDocumentTabs, { TabType } from '@hooks/useDocumentTabs';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { useGetUserUploads } from '@resources/editor-page';
import clsx from 'clsx';
import { BookUp, Globe2, Library, RefreshCw, Search } from 'lucide-react';
import React, { ChangeEvent, memo, useCallback } from 'react';
import { FaStopCircle } from 'react-icons/fa';

type Props = {
	cancelHandler: () => void;
	regenerateHandler: () => void;
	isRegenerateSeen?: boolean;
	searchInputValue: string;
	setSearchInputValue: React.Dispatch<React.SetStateAction<string>>;
	isLoading: boolean;
	isSearching: boolean;
	isSearchOpen: boolean;
	setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
	isSettingsOpen: boolean;
	setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ChatInputSetting = ({
	regenerateHandler,
	isRegenerateSeen,
	cancelHandler,
	searchInputValue,
	setSearchInputValue,
}: Props) => {
	const { user } = useUser();
	const { projectId } = useGetEditorRouter();
	const chatContext = useChatStore(s => s.chatContext);
	const setChatContext = useChatStore(s => s.setChatContext);

	const isHandling = useChatStore(s => s.isHandling);

	const setActiveFileReference = useChatStore(s => s.setActiveFileReference);
	const { data: uploadFiles } = useGetUserUploads(user?.id, projectId);
	const activeFileReference = useChatStore(s => s.activeFileReference);
	const { openDocument } = useDocumentTabs();

	const rightPanelWidth = useUIStore(s => s.rightPanelWidth);

	const onChange = useCallback((e: ChangeEvent) => {
		const value = (e.target as HTMLInputElement).value;
		if (value) {
			setSearchInputValue(value);
		}
	}, []);

	return (
		<div className="flex justify-between pt-2 pb-2 text-xs">
			<div className="flex  max-w-full gap-2  ">
				<DropdownMenu>
					<DropdownMenuTrigger>
						<div
							onClick={() => {
								// setIsSettingsOpen(true);
							}}
							className="px-2 py-1 transition-all duration-100 ease-in-out bg-white rounded-md border hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer dark:bg-neutral-950 "
						>
							Context:{' '}
							{chatContext === 'project'
								? 'Default'
								: chatContext === 'realtime'
								? 'Realtime'
								: chatContext === 'references'
								? activeFileReference?.name || 'All Documents'
								: 'PDF'}
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side="top"
						align="start"
						sideOffset={10}
						className="max-w-[300px] py-2"
					>
						<DropdownMenuLabel className="py-2.5">
							Chat Context
						</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => setChatContext('project')}
							className="py-2"
						>
							<Logomark className="h-8 w-8 mr-2" />
							<div>
								<div className="font-bold">Isaac</div>
								<div className="text-xs">
									Isaac&apos;s base model & infinite chat history
								</div>
							</div>
						</DropdownMenuItem>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger className="py-2.5">
								<Library className="h-5 w-5 mr-3.5 ml-1.5 shrink-0" />
								<div>
									<div className="font-bold">References</div>
									<div className="text-xs">
										All your uploaded papers & documents. Or just a single file.
									</div>
								</div>
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent sideOffset={10} className="w-56">
									{uploadFiles?.length > 0 ? (
										<>
											<DropdownMenuItem
												key="all-documents"
												className={clsx(
													'flex gap-2 items-start py-2',
													!activeFileReference?.name &&
														'bg-neutral-100 font-semibold dark:bg-neutral-800',
												)}
												onClick={() => {
													setChatContext('references');
													setActiveFileReference({
														name: null,
														fileId: null,
													});
												}}
											>
												<div>
													<Library
														strokeWidth={1.4}
														className="mr-2 h-4 w-4 shrink-0 text-neutral-500"
													/>
												</div>
												<p>All documents</p>
											</DropdownMenuItem>

											{uploadFiles?.map(file => (
												<DropdownMenuItem
													key={file.id}
													className={clsx(
														'flex gap-2 items-start py-2',
														file.id === activeFileReference?.fileId &&
															'bg-neutral-100 font-semibold dark:bg-neutral-800',
													)}
													onClick={() => {
														const name =
															file.custom_citation?.title || file.file_name;
														setChatContext('references');
														setActiveFileReference({
															name:
																file.custom_citation?.title || file.file_name,
															fileId: file.id,
														});
														openDocument({
															source: file.id,
															label: name,
															type: TabType.UserUpload,
														});
													}}
												>
													<div>
														<BookUp
															strokeWidth={1.4}
															className="mr-2 h-4 w-4 shrink-0 text-neutral-500"
														/>
													</div>
													<p className="truncate">
														{file.custom_citation?.title || file.file_name}
													</p>
												</DropdownMenuItem>
											))}
										</>
									) : (
										<DropdownMenuItem
											key="all-documents"
											disabled
											onClick={() => {
												setChatContext('references');
												setActiveFileReference({
													name: null,
													fileId: null,
												});
											}}
											className="text-center text-xs"
										>
											No References Uploaded
										</DropdownMenuItem>
									)}
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
						<DropdownMenuItem
							onClick={() => setChatContext('realtime')}
							className="py-2"
						>
							<Globe2 className="h-5 w-5 mr-3.5 ml-1.5" />
							<div>
								<div className="font-bold">Realtime Data</div>
								<div className="text-xs">
									Included: Realtime data sourced from the web
								</div>
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				{/* //TODO: Creativity doesnt do anything right now */}
				{/* <Popover>
					<PopoverTrigger>
						<div
							onClick={() => {
								// setIsSettingsOpen(true);
							}}
							className="px-2 py-1 transition-all duration-100 ease-in-out bg-white rounded-md border hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer dark:bg-neutral-950 "
						>
							Creativity: {(temperature * 100).toFixed(0)} %
						</div>
					</PopoverTrigger>
					<PopoverContent side="top" sideOffset={10}>
						<div className="mb-4">
							<div className="font-medium">Creativity</div>
							<div className="text-xs text-neutral-500">
								Lower creativity means generating answers based on the context
								strictly.
							</div>
						</div>
						<Slider
							className="bg-transparent"
							min={0}
							max={1}
							step={0.01}
							defaultValue={[temperature]}
							onValueChange={value => {
								setTemperature(value[0]);
							}}
							id="creativity"
						/>
						<div className="flex items-center justify-between text-sm text-neutral-500">
							<span className="text-xs">0</span>
							<span className="text-xs">100</span>
						</div>
					</PopoverContent>
				</Popover> */}
				{isHandling && (
					<InputSettingButton onClick={cancelHandler}>
						Stop Generation{' '}
						<FaStopCircle size="10" className="inline-block animate-pulse" />
					</InputSettingButton>
				)}
				{isRegenerateSeen && (
					<InputSettingButton onClick={regenerateHandler}>
						Regenerate <RefreshCw size="10" className="inline-block" />
					</InputSettingButton>
				)}
			</div>
			{!isHandling && (
				<Popover>
					<PopoverTrigger asChild>
						<div className="flex text-xs items-center gap-1 px-2 py-1 transition-all duration-100 ease-in-out bg-white rounded-md border hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer dark:bg-neutral-950">
							<Search size="10" className="inline-block" /> Search
						</div>
					</PopoverTrigger>
					<PopoverContent
						side="top"
						align="end"
						className="p-1"
						style={{ width: rightPanelWidth - 46 }}
					>
						<div
							onSubmit={e => {
								e.preventDefault();
								alert('search');
							}}
							className="text-xs text-neutral-500 relative flex max-h-max"
						>
							<Search
								strokeWidth={1.4}
								className="absolute my-3 ml-2 h-4 w-4"
							/>
							<Input
								className="w-full focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 pl-10"
								value={searchInputValue}
								onChange={onChange}
								onKeyDown={e => {
									// Prevent Enter from triggering form submit
									if (e.key === 'Enter') e.preventDefault();
								}}
							/>
						</div>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
};

export default memo(ChatInputSetting);
