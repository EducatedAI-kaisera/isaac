import Spinner from '@components/core/Spinner';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Input } from '@components/ui/input';
import { ScrollArea } from '@components/ui/scroll-area';
import { Toggle } from '@components/ui/toggle';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@components/ui/tooltip';
import useChatStore from '@context/chat.store';
import { useLiteratureReferenceStore } from '@context/literatureReference.store';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';
import React, { ChangeEvent, useCallback } from 'react';
import { BsFileEarmarkPdf, BsFiles } from 'react-icons/bs';

// Types
interface HeaderProps {
	searchInputValue: string;
	setSearchInputValue: React.Dispatch<React.SetStateAction<string>>;
	isLoading: boolean;
	isSearching: boolean;
	isSearchOpen: boolean;
	setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
	isSettingsOpen: boolean;
	setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Animations
const searchBarVariants = {
	hidden: {
		opacity: 0,
		height: 0,
		overflow: 'hidden',
		y: -5,
		marginTop: 0,
		marginBottom: 0,
		zIndex: -1,
	},
	visible: {
		marginTop: 10,
		marginBottom: 5,
		y: 0,
		opacity: 1,
		height: 'auto',
	},
};

const Header = ({
	searchInputValue,
	setSearchInputValue,

	isSearching,
	isSearchOpen,

	setIsSearchOpen,
	setIsSettingsOpen,
}: HeaderProps) => {
	const uploadFiles = useLiteratureReferenceStore(s => s.userUploads);
	const chatContext = useChatStore(s => s.chatContext);
	const setActiveFileReference = useChatStore(s => s.setActiveFileReference);
	const activeFileReference = useChatStore(s => s.activeFileReference);

	const onChange = useCallback(
		(e: ChangeEvent) => {
			const value = (e.target as HTMLInputElement).value;
			if (value) {
				setSearchInputValue(value);
			}
		},
		[setSearchInputValue],
	);

	return (
		<motion.div
			layout="size"
			className={clsx(
				'absolute top-0 left-0 right-0 z-50 px-4 py-2 ',
				isSearchOpen
					? 'dark:bg-neutral-900 bg-desertStorm-100'
					: 'bg-transparent',
			)}
		>
			{/* Top Container */}
			<div className="flex items-center justify-between ">
				{/* Chat Menu Buttons */}
				<div className="flex flex-row items-center w-full justify-end ">
					{chatContext === 'references' && (
						<DropdownMenu>
							<Tooltip>
								<DropdownMenuTrigger asChild>
									<TooltipTrigger asChild>
										<Toggle
											className="text-neutral-500 max-w-[300px] flex gap-2"
											size="sm"
											pressed={false}
										>
											<div className="text-neutral-500">
												{activeFileReference ? (
													<BsFileEarmarkPdf size={16} />
												) : (
													// <BsFiles size={16} />
													<></>
												)}
											</div>
											<span className="truncate">
												{activeFileReference?.name || 'Select File'}
											</span>
											<ChevronDown size={18} />
										</Toggle>
									</TooltipTrigger>
								</DropdownMenuTrigger>
								<TooltipContent>
									<p>
										{activeFileReference
											? activeFileReference.name
											: 'Referencing all files'}
									</p>
								</TooltipContent>
							</Tooltip>

							<DropdownMenuContent>
								<ScrollArea className="max-h-128">
									<DropdownMenuItem
										className={clsx(
											'w-[200px] flex gap-2',
											activeFileReference === undefined &&
												'bg-neutral-100 font-semibold dark:bg-neutral-800',
										)}
										onClick={() => setActiveFileReference(undefined)}
									>
										<div>
											<BsFiles size={18} className="text-neutral-500" />
										</div>
										<span>All Files</span>
									</DropdownMenuItem>
									{uploadFiles?.map(file => (
										<DropdownMenuItem
											key={file.id}
											className={clsx(
												'w-[200px] flex gap-2 items-start py-2',
												file.id === activeFileReference?.fileId &&
													'bg-neutral-100 font-semibold dark:bg-neutral-800',
											)}
											onClick={() =>
												setActiveFileReference({
													name: file.file_name,
													fileId: file.id,
												})
											}
										>
											<div>
												<BsFileEarmarkPdf
													size={18}
													className="text-neutral-500"
												/>
											</div>
											<p className="">{file.file_name}</p>
										</DropdownMenuItem>
									))}
								</ScrollArea>
							</DropdownMenuContent>
						</DropdownMenu>
					)}

					<Toggle
						variant="ghost"
						size="sm"
						pressed={false}
						onClick={() => {
							setIsSearchOpen(prev => !prev);
							setIsSettingsOpen(false);
						}}
					>
						{isSearchOpen ? (
							<X className="text-gray-500" size={16} />
						) : (
							<Search className="text-gray-500" size={16} />
						)}
					</Toggle>
				</div>
			</div>
			{/* Bottom Container */}
			<motion.form
				variants={searchBarVariants}
				animate={isSearchOpen ? 'visible' : 'hidden'}
				initial="hidden"
				onSubmit={e => e.preventDefault()} // Prevent form from submitting on Enter
			>
				<div
					className={clsx(
						'flex items-center w-full border rounded-md pr-4 dark:border-neutral-600 border-neutral-400 focus-within:border-border focus-within:ring-ring focus-within:ring-[1px]',
					)}
				>
					<Input
						value={searchInputValue}
						onChange={onChange}
						onKeyDown={e => {
							// Prevent Enter from triggering form submit
							if (e.key === 'Enter') e.preventDefault();
						}}
						className={clsx(
							'!border-none peer focus:!ring-0 focus:!outline-none focus:!border-none focus:!ring-transparent focus:!ring-offset-transparent focus:!bg-transparent focus:!shadow-none placeholder:text-neutral-500',
							!isSearchOpen && 'pointer-events-none',
						)}
						placeholder="Search"
					/>
					{isSearching && <Spinner />}
				</div>
			</motion.form>
		</motion.div>
	);
};

export default Header;
