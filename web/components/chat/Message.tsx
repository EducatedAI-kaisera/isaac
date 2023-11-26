import SaveAndCopyButton from '@components/chat/SaveAndCopyButton';
import { Logomark } from '@components/landing/Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { Toggle } from '@components/ui/toggle';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@components/ui/tooltip';
import useApplyChangesToEditor from '@hooks/api/isaac/useApplyChangesToEditor';
import useDocumentTabs, { TabType } from '@hooks/useDocumentTabs';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { useGetReference } from '@resources/editor-page';
import clsx from 'clsx';
import { Clipboard, ClipboardPaste, Save } from 'lucide-react';
import React, { forwardRef, HTMLAttributes, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Remarkable } from 'remarkable';
import { ChatMessage, LiteratureSource } from 'types/chat';

interface MessageProps {
	message: ChatMessage;
	email: string;
	avatarUrl: string;
	saveToNote: (text: string) => void;
	saveToReferencesHandler?: (source: LiteratureSource) => void;
}

// TODO: Split this component into its own dedicated component
const Message = ({
	message,
	email,
	avatarUrl,
	saveToNote,
	saveToReferencesHandler,
}: MessageProps) => {
	const { projectId } = useGetEditorRouter();
	const isAssistant = message.metadata.role === 'assistant';
	const isTypeRegular = message.metadata.type == 'regular';
	const isTypeManipulation = message.metadata.type === 'manipulation';
	const isTypeSources = message.metadata.type === 'sources';
	const isTypeLibrary = message.metadata.type === 'library';
	const md = new Remarkable();
	const markdownContent = md.render(message.content);

	const { data: referenceList } = useGetReference(projectId);

	const { applyChanges, editorFocused } = useApplyChangesToEditor();

	const { openDocument } = useDocumentTabs();

	const copyToClipboard = (newMessage: string) => {
		navigator.clipboard.writeText(newMessage); //T-75 decide what type of content we want to copy
		toast.success('Copied');
	};

	const onSaveClick = useCallback(() => {
		saveToNote(message.content);
	}, [message.content]);

	const onCopyClick = useCallback(
		() => copyToClipboard(message.content),
		[message.content],
	);

	return (
		<div
			className="flex items-start w-full gap-3 animate-fade-in"
			key={message.id}
		>
			{/* Avatar */}
			<div>
				{!isAssistant ? (
					<Avatar className="w-8 h-8 text-xs rounded-lg">
						<AvatarImage src={avatarUrl} alt="user-pp" />
						<AvatarFallback>{email?.slice(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
				) : (
					<Logomark className="w-8 h-8  flex-none fill-primary" />
				)}
			</div>
			{/* Right Container */}
			<div className="w-full">
				{/* Username and Menu */}
				<div className="flex items-center justify-between w-full">
					{/* Username */}
					<div className="text-xs font-bold dark:text-neutral-600">
						{isAssistant ? 'ISAAC' : 'YOU'}
					</div>
					{/* Menu */}
					{isAssistant && isTypeRegular && (
						<div className="flex items-center text-gray-500">
							<SaveAndCopyButton
								onSaveClick={onSaveClick}
								onCopyClick={onCopyClick}
							/>
						</div>
					)}
				</div>
				{/* Message */}
				<div className="max-w-full markdown-container whitespace-pre-wrap pr-4">
					{/* Manipulation Heading */}
					<div className="mb-2 text-sm font-semibold">
						{message.metadata.manipulation_title}
					</div>
					{/* Rendered Message */}
					<div
						className={clsx(
							isTypeManipulation && isAssistant && 'p-4 rounded-sm bg-muted',
						)}
					>
						{!isTypeSources && message.content.length > 0 ? (
							<div dangerouslySetInnerHTML={{ __html: markdownContent }} />
						) : isTypeRegular ? (
							<div className="flex items-center gap-1 animate-pulse">
								<div className="w-2 h-2 bg-orange-400 rounded-full" />
								<div className="text-sm text-neutral-500">Thinking...</div>
							</div>
						) : null}
						{/* Regenerate Button for Manipulation */}
						{isTypeManipulation && isAssistant && (
							<div className="flex mt-4 gap-4 justify-between items-end">
								<Button
									onClick={e => {
										e.preventDefault();
										applyChanges(message.content);
									}}
									variant="outline"
									size="sm"
								>
									Apply Changes
									<ClipboardPaste className="ml-2" size="14" />
								</Button>
								<div>
									<SaveAndCopyButton
										buttonOpacity={0.6}
										onSaveClick={onSaveClick}
										onCopyClick={onCopyClick}
									/>
								</div>
							</div>
						)}
					</div>
					{/* Sources */}
					{isTypeSources && (
						<div className="mt-4 space-y-4">
							{message.metadata?.sources?.map(source => {
								return (
									<div
										className="flex items-start justify-between"
										key={source.paperId}
									>
										<div>
											<a
												className="font-bold text-sm hover:underline"
												href={source.url}
												target="_blank"
												rel="noreferrer"
											>
												{source.title}
											</a>
											<div className="text-sm text-neutral-500">
												{typeof source.authors === 'string'
													? source.authors
													: source?.authors
															?.map(a => a.name)
															.join(', ')
															.concat(` ${source.year}`)}
											</div>
										</div>
										<div className="flex  text-gray-500">
											{/* Save */}

											<Tooltip>
												<TooltipTrigger asChild>
													<Toggle
														variant="ghost"
														size="sm"
														pressed={referenceList
															?.map(r => r.doi)
															?.includes(source.doi)}
														onClick={() => {
															!referenceList
																.map(r => r.doi)
																.includes(source.doi) &&
																saveToReferencesHandler(source);
														}}
													>
														<Save size="16" />
													</Toggle>
												</TooltipTrigger>
												<TooltipContent className="mb-2 mr-2 shadow-md text-neutral-500">
													<p className="text-sm">Save to References</p>
												</TooltipContent>
											</Tooltip>
											{/* Copy */}

											<Tooltip>
												<TooltipTrigger asChild>
													<Toggle
														variant="ghost"
														size="sm"
														pressed={false}
														// TODO: get citation
														// onClick={copyToClipboard}
													>
														<Clipboard size="16" />
													</Toggle>
												</TooltipTrigger>
												<TooltipContent className="mb-2 mr-2 shadow-md text-neutral-500">
													<p className="text-sm">Get citation</p>
												</TooltipContent>
											</Tooltip>
										</div>
									</div>
								);
							})}
						</div>
					)}
					{/* Footnotes for library answers */}
					{message.metadata.footnotes && (
						<ul className="flex gap-1 flex-row w-full mt-2 pt-2">
							{message.metadata.footnotes.map((source, index) => (
								<Tooltip key={index}>
									<TooltipTrigger asChild>
										<button
											onClick={() => {
												openDocument({
													source: source.id,
													label: source.title,
													type: TabType.UserUpload,
												});
											}}
											// variant="link"
											className="text-xs text-muted-foreground hover:text-foreground"
										>
											{`[${index + 1}]`}
										</button>
									</TooltipTrigger>
									<TooltipContent>
										<SourceToolTipContent source={source} />
									</TooltipContent>
								</Tooltip>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
};

export default Message;

const SourceToolTipContent = ({ source }) => (
	<div className="p-1 flex flex-col gap-1">
		{/* <p>{source.pageContent}</p> */}
		<strong>
			{source.title}, Page&nbsp;
			{source.page}
		</strong>
	</div>
);

const TooltipWrapper = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} {...props}></div>);

TooltipWrapper.displayName = 'TooltipWrapper';
