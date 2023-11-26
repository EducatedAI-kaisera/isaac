import ChatSessionCard from '@components/chatV2/ChatSessionCard';
import useChatStoreV2 from '@context/chatSessions.store';
import useDeleteChatSession from '@hooks/api/useChatSession.delete';
import useGetChatSessions from '@hooks/api/useChatSession.get';
import useDocumentTabs, {
	TabType,
	UniqueTabSources,
} from '@hooks/useDocumentTabs';
import React from 'react';

const ChatSessionList = () => {
	const { projectId, openDocument } = useDocumentTabs();
	const { setChatSidebar } = useChatStoreV2(s => s.actions);
	const { data: chatSessions } = useGetChatSessions(projectId);
	const { mutateAsync } = useDeleteChatSession();
	return (
		<div className="px-3 flex flex-col gap-2 h-[calc(100vh-90px)] overflow-scroll">
			<ChatSessionCard
				type="NEW"
				onClick={() => {
					setChatSidebar('DETAIL', {
						title: 'New Chat',
						sessionId: UniqueTabSources.NEW_CHAT,
					});
				}}
				onOpenTabClick={() =>
					openDocument({
						type: TabType.Chat,
						source: UniqueTabSources.NEW_CHAT,
						label: 'New Chat',
					})
				}
			/>

			{/* List */}
			<p className="text-xs font-semibold text-gray-600 mt-3">Today</p>
			{chatSessions?.map(({ type, id, title }) => (
				<ChatSessionCard
					key={id}
					type={type}
					label={title}
					onClick={() => {
						setChatSidebar('DETAIL', { title, sessionId: id });
					}}
					onOpenTabClick={() =>
						openDocument({
							type: TabType.Chat,
							source: id,
							label: title,
						})
					}
					onDeleteClick={() => mutateAsync({ sessionId: id })}
				/>
			))}
		</div>
	);
};

export default ChatSessionList;
