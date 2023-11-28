import ChatPanel from '@components/chat/ChatPanel';
import ChatSessionList from '@components/chat/ChatSessionList';
import useChatStoreV2 from '@context/chatSessions.store';
import useDocumentTabs, { TabType } from '@hooks/useDocumentTabs';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import React from 'react';

const ChatSessions = () => {
	// move these to global state
	const { setChatSidebar } = useChatStoreV2(s => s.actions);
	const chatSidebar = useChatStoreV2(s => s.chatSidebar);
	const { openDocument } = useDocumentTabs();

	return (
		<div className="w-full flex flex-col gap-1 h-full">
			{/* HEADER */}
			<div className="flex justify-between p-3 ">
				<p className="font-semibold mb-2 text-sm flex gap-2 items-center">
					{chatSidebar[0] === 'LIST' && 'Chat Sessions'}

					{chatSidebar[0] === 'DETAIL' && (
						<>
							<ArrowLeft
								size={20}
								onClick={() => {
									setChatSidebar('LIST');
								}}
								className="text-gray-600 hover:text-isaac cursor-pointer"
								strokeWidth={1}
							/>
							<span>{chatSidebar[1].title}</span>
						</>
					)}
				</p>
				{chatSidebar[0] === 'DETAIL' && (
					<div className="flex gap-2">
						<ArrowUpRight
							size={20}
							onClick={() => {
								openDocument({
									type: TabType.Chat,
									source: chatSidebar[1].sessionId,
									label: chatSidebar[1].title,
								});
								setChatSidebar('LIST');
							}}
							className="text-gray-600 hover:text-isaac cursor-pointer"
							strokeWidth={1}
						/>
					</div>
				)}
			</div>

			{/* CONTENT */}
			{chatSidebar[0] === 'LIST' && <ChatSessionList />}
			{chatSidebar[0] === 'DETAIL' && <ChatPanel />}
		</div>
	);
};

export default ChatSessions;
