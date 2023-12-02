import ChatSessionCard from '@components/chat/ChatSessionCard';
import useChatStoreV2 from '@context/chatSessions.store';
import useDeleteChatSession from '@hooks/api/useChatSession.delete';
import useGetChatSessions from '@hooks/api/useChatSession.get';
import useDocumentTabs, {
	TabType,
	UniqueTabSources,
} from '@hooks/useDocumentTabs';
import React from 'react';
import { isToday, isYesterday, isWithinInterval, subDays, isBefore } from 'date-fns';

const ChatSessionList = () => {
	const { projectId, openDocument } = useDocumentTabs();
	const { setChatSidebar } = useChatStoreV2(s => s.actions);
	const { data: chatSessions } = useGetChatSessions(projectId);
	const { deleteSession, DeleteConfirmationDialog } = useDeleteChatSession();

	const sortedChatSessions = React.useMemo(() => {
		return chatSessions?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	}, [chatSessions]);

	const today = React.useMemo(() => sortedChatSessions?.filter(session => isToday(new Date(session.created_at))), [sortedChatSessions]);
	const yesterday = React.useMemo(() => sortedChatSessions?.filter(session => isYesterday(new Date(session.created_at))), [sortedChatSessions]);
	const lastSevenDays = React.useMemo(() => sortedChatSessions?.filter(session => isWithinInterval(new Date(session.created_at), { start: subDays(new Date(), 7), end: new Date() })), [sortedChatSessions]);
	const lastThirtyDays = React.useMemo(() => sortedChatSessions?.filter(session => isWithinInterval(new Date(session.created_at), { start: subDays(new Date(), 30), end: new Date() })), [sortedChatSessions]);
	const older = React.useMemo(() => sortedChatSessions?.filter(session => isBefore(new Date(session.created_at), subDays(new Date(), 30))), [sortedChatSessions]);

	return (
		<div className="px-3 flex flex-col gap-2 h-[calc(100vh-90px)] overflow-scroll">
			<DeleteConfirmationDialog />
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
			{today?.length > 0 && <p className="text-xs font-semibold text-gray-600 mt-3">Today</p>}
			{today?.map(({ type, id, title }) => (
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
					onDeleteClick={() => deleteSession(id, title)}
				/>
			))}
			{yesterday?.length > 0 && <p className="text-xs font-semibold text-gray-600 mt-3">Yesterday</p>}
			{yesterday?.map(({ type, id, title }) => (
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
					onDeleteClick={() => deleteSession(id, title)}
				/>
			))}
			{lastSevenDays?.length > 0 && <p className="text-xs font-semibold text-gray-600 mt-3">Last 7 Days</p>}
			{lastSevenDays?.map(({ type, id, title }) => (
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
					onDeleteClick={() => deleteSession(id, title)}
				/>
			))}
			{lastThirtyDays?.length > 0 && <p className="text-xs font-semibold text-gray-600 mt-3">Last 30 Days</p>}
			{lastThirtyDays?.map(({ type, id, title }) => (
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
					onDeleteClick={() => deleteSession(id, title)}
				/>
			))}
			{older?.length > 0 && <p className="text-xs font-semibold text-gray-600 mt-3">Older</p>}
			{older?.map(({ type, id, title }) => (
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
					onDeleteClick={() => deleteSession(id, title)}
				/>
			))}
		</div>
	);
};

export default React.memo(ChatSessionList);
