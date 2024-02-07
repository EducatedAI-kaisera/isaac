import useChatSessions from '@context/chatSessions.store';
import useUpdateChatSession from '@hooks/api/useChatSession.update';
import { QKFreeAIToken } from '@hooks/api/useFreeTierLimit.get';
import useDocumentTabs from '@hooks/useDocumentTabs';
import { useQueryClient } from '@tanstack/react-query';
import { base64ToUint8Array } from '@utils/base64ToUint8Array';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SSE } from 'sse.js';

const useGenerateChatSessionTitle = (minimized: boolean) => {
	const [triggerRename, setTriggerRename] = useState<{
		source: string;
		newName: string;
	}>();
	const queryClient = useQueryClient();
	const { renameTab } = useDocumentTabs();
	const { mutateAsync: updateSessionTitle } = useUpdateChatSession();
	const { streamChatSidebarTitle } = useChatSessions(s => s.actions);

	const generateTitle = (
		sessionId: string,
		messages: { role: string; content: string }[],
	) => {
		const source = new SSE(`/api/generate-conversation-title`, {
			payload: JSON.stringify({
				messages,
			}),
		});

		let cumulativeChunk = '';

		// Start Streaming
		try {
			source.addEventListener('message', async function (e) {
				const uint8Array = base64ToUint8Array(e.data);
				const eventMessage = new TextDecoder('utf-8').decode(uint8Array);
				if (eventMessage === '[DONE]') {
					source.close();
					cumulativeChunk &&
						(await updateSessionTitle({ sessionId, title: cumulativeChunk }));
					setTriggerRename({ source: sessionId, newName: cumulativeChunk });
					queryClient.invalidateQueries({
						queryKey: [QKFreeAIToken],
					});
				} else {
					const chunkText = eventMessage;

					if (chunkText !== undefined) {
						cumulativeChunk = cumulativeChunk + chunkText;
					}
				}
			});

			source.stream();
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			console.log({ error });
			toast.error('Something went wrong. Please try again.');
		}
	};

	useEffect(() => {
		if (triggerRename) {
			if (minimized) {
				streamChatSidebarTitle(triggerRename.newName);
			} else {
				renameTab(triggerRename.source, triggerRename.newName);
			}
			setTriggerRename(undefined);
		}
	}, [triggerRename, minimized]);

	return { generateTitle };
};

export default useGenerateChatSessionTitle;
