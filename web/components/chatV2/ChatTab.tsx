import ChatboxV2 from '@components/chatV2/ChatboxV2';
import ChatInputSetting from '@components/chatV2/ChatInputSettingV2';
import ChatInput from '@components/chatV2/ChatInputV2';
import useChatSessions from '@context/chatSessions.store';
import { retrieveChatMessages } from '@hooks/api/isaac/useRetrieveChatMessages';
import useDocumentTabs, {
	TabType,
	UniqueTabSources,
} from '@hooks/useDocumentTabs';
import clsx from 'clsx';
import { default as React, useEffect } from 'react';

type Props = {
	active: boolean;
	sessionId: string;
};

const ChatTab = ({ active, sessionId }: Props) => {
	const { activeDocument } = useDocumentTabs();
	const { initializeChatSession } = useChatSessions(s => s.actions);

	const chatSessionContext = useChatSessions(
		s => s.chatSessions[sessionId]?.chatContext,
	);

	// * Initialize chat content
	useEffect(() => {
		if (
			activeDocument?.type === TabType.Chat &&
			sessionId !== UniqueTabSources.NEW_CHAT &&
			chatSessionContext === undefined
		) {
			// initialize chat
			retrieveChatMessages(sessionId).then(chatMessages => {
				initializeChatSession(sessionId, chatMessages);
			});
		}
	}, [chatSessionContext, activeDocument, sessionId]);

	return (
		<div
			className={clsx(
				'relative h-full max-w-[1400px] mx-auto',
				active ? 'block' : 'hidden',
			)}
		>
			<ChatboxV2 sessionId={sessionId} />
			<div className="absolute w-full bottom-0">
				<ChatInputSetting sessionId={sessionId} />
				<ChatInput sessionId={sessionId} />
			</div>
		</div>
	);
};

export default ChatTab;
