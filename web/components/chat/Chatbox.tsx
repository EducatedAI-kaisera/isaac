import Message from '@components/chat/Message';
import { Logomark } from '@components/landing/Logo';
import useChatSessions from '@context/chatSessions.store';
import { UniqueTabSources } from '@hooks/useDocumentTabs';
import clsx from 'clsx';
import { memo } from 'react';
// Types
interface ChatBoxProps {
	sessionId: string;
	minimized?: boolean;
}

const ChatBoxV2 = ({ sessionId, minimized }: ChatBoxProps) => {
	const messages = useChatSessions(s => s.chatSessions[sessionId]?.messages);

	// TODO: Handle empty chat
	return (
		<div
			className={clsx(
				'z-0 w-full pt-2 overflow-y-scroll pb-6 scrollbar-hide flex flex-col',
				minimized
					? 'h-[calc(100vh-220px)] gap-1 px-4 '
					: 'h-[calc(100vh-230px)]  gap-6 pr-8',
			)}
		>
			{sessionId === UniqueTabSources.NEW_CHAT && (
				<div className="flex flex-col  my-52 justify-center opacity-50 select-none">
					<Logomark className="w-20 h-20 mx-auto" />
					<p className="text-center">Chat with Isaac about your research!</p>
				</div>
			)}
			{messages?.map(message => (
				<Message
					key={message.id}
					id={message.id}
					minimized={minimized}
					role={message.role}
					content={message.content}
					linkedNoteId={message.note_id}
				/>
			))}
		</div>
	);
};

export default memo(ChatBoxV2);
