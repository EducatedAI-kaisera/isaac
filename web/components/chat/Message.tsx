import { Logomark } from '@components/landing/Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { useUser } from '@context/user';
import { useHover } from '@mantine/hooks';
import useCreateNote from '@resources/notes';
import { supabase } from '@utils/supabase';
import clsx from 'clsx';
import { Clipboard, ClipboardCheck, StickyNote } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { ChatRoles } from 'types/chat';

type Props = {
	id: string;
	content: string;
	role: ChatRoles;
	minimized?: boolean;
	linkedNoteId?: string;
	isHandling?: boolean;
};

const MessageV2 = React.memo(
	({ id, content, role, minimized, linkedNoteId, isHandling }: Props) => {
		const [copied, setCopied] = useState(false);
		const [linkedNote, setLinkedNote] = useState(linkedNoteId);

		const { user } = useUser();

		const copyToClipboard = useCallback(() => {
			navigator.clipboard.writeText(content);
			setCopied(true);
		}, [content]);

		const { mutateAsync: createNote } = useCreateNote({
			onSuccess: data => {
				supabase
					.from('chat_messages')
					.update({ note_id: data.id })
					.eq('id', id)
					.then(() => setLinkedNote(data.id)); // Optimistic update
			},
		});

		useEffect(() => {
			let timeoutId;
			if (copied) {
				timeoutId = setTimeout(() => setCopied(false), 2500);
			}
			return () => clearTimeout(timeoutId);
		}, [copied]);

		const { hovered, ref } = useHover();

		return (
			<div className="relative" ref={ref}>
				<div className={clsx('flex', minimized ? 'text-sm gap-3' : 'gap-5')}>
					<p className="mt-1">
						{role === 'user' ? (
							<Avatar
								className={clsx(
									' text-xs rounded-lg',
									minimized ? 'w-5 h-5' : 'w-6 h-6',
								)}
							>
								<AvatarImage
									src={user?.user_metadata?.avatar_url}
									alt="user-pp"
								/>
								<AvatarFallback>
									{user?.email?.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						) : (
							<Logomark
								className={clsx(
									'flex-none fill-primary scale-125',
									minimized ? 'w-5 h-5' : 'w-6 h-6',
								)}
							/>
						)}
					</p>
					<div className="prose prose-sm max-w-xl leading-8">
						{isHandling && !content && (
							<div className="flex justify-center gap-1 pt-3">
								<span className="w-2 h-2 rounded-full bg-isaac/50 animate-bounce"></span>
								<span className="w-2 h-2 rounded-full bg-isaac/50 animate-bounce delay-100"></span>
								<span className="w-2 h-2 rounded-full bg-isaac/50 animate-bounce delay-200"></span>
							</div>
						)}
						<Markdown rehypePlugins={[rehypeHighlight]}>{content}</Markdown>
					</div>
				</div>

				{/* Common Action Buttons */}
				<div>
					{!minimized ? (
						<div
							className={clsx(
								'absolute -right-8 top-0 flex flex-col gap-2',
								role === 'user' && 'hidden',
							)}
						>
							<button
								onClick={copyToClipboard}
								className={clsx(
									' cursor-pointer transition-colors',
									copied ? 'text-isaac' : 'text-gray-500 hover:text-gray-800',
								)}
							>
								{copied ? (
									<ClipboardCheck size={18} strokeWidth={1.5} />
								) : (
									<Clipboard size={18} strokeWidth={1.5} />
								)}
							</button>
							{!linkedNote && (
								<button
									className={clsx(
										' cursor-pointer transition-colors',
										'text-gray-500 hover:text-gray-800',
									)}
									onClick={() => (linkedNote ? '' : createNote(content))}
								>
									<StickyNote size={18} strokeWidth={1.5} />
								</button>
							)}
						</div>
					) : (
						<div
							className={clsx(
								'transition-opacity text-xs ml-8 mt-1 flex gap-1',
								hovered && role === 'assistant' ? 'opacity-100' : 'opacity-0',
							)}
						>
							<button
								className={clsx('text-isaac', role === 'user' && 'hidden')}
								onClick={copyToClipboard}
							>
								{copied ? 'Copied!' : 'Copy'}
							</button>
							<span>·</span>
							<button
								className={clsx('text-isaac', role === 'user' && 'hidden')}
								onClick={() => (linkedNote ? '' : createNote(content))}
							>
								{linkedNote ? 'View in Note' : 'Save to Note'}
							</button>
						</div>
					)}
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.id === nextProps.id &&
			prevProps.content === nextProps.content &&
			prevProps.minimized === nextProps.minimized &&
			prevProps.linkedNoteId === nextProps.linkedNoteId &&
			prevProps.isHandling === nextProps.isHandling
		);
	},
);

export default MessageV2;
