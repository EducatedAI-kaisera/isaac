import Chatbox from '@components/chat/Chatbox';
import ChatInputSetting from '@components/chat/ChatInputSetting';
import ChatInput from '@components/chat/ChatInput';
import useChatSessions from '@context/chatSessions.store';
import { retrieveChatMessages } from '@hooks/api/isaac/useRetrieveChatMessages';
import { UniqueTabSources } from '@hooks/useDocumentTabs';
import React, { useEffect } from 'react';

const ChatPanel = () => {
	const [section, { title, sessionId }] = useChatSessions(s => s.chatSidebar);
	const { initializeChatSession } = useChatSessions(s => s.actions);

	const chatSessionContext = useChatSessions(
		s => s.chatSessions[sessionId]?.chatContext,
	);

	// * Initialize chat content
	useEffect(() => {
		if (
			sessionId !== UniqueTabSources.NEW_CHAT &&
			chatSessionContext === undefined
		) {
			// initialize chat
			retrieveChatMessages(sessionId).then(chatMessages => {
				initializeChatSession(sessionId, chatMessages);
			});
		}
	}, [chatSessionContext, sessionId]);

	return (
		<>
			<Chatbox sessionId={sessionId} minimized />
			<div className="absolute w-full bottom-0 px-3">
				<ChatInputSetting minimized sessionId={sessionId} />
				<ChatInput minimized sessionId={sessionId} />
			</div>
		</>
	);
};

export default ChatPanel;
