import {
	ProPlanUpgradeToast,
	reachedTokenLimitToastStyle,
} from '@components/toast/ProPlanUpgradToast';
import { useUser } from '@context/user';
import { QKFreeAIToken } from '@hooks/api/useFreeTierLimit.get';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { useQueryClient } from '@tanstack/react-query';
import { base64ToUint8Array } from '@utils/base64ToUint8Array';
import { freePlanLimits } from 'data/pricingPlans';
import toast from 'react-hot-toast';
import { SSE } from 'sse.js';
import { ChatContext } from 'types/chat';

const useStreamChatMessage = () => {
	const { user } = useUser();
	const { projectId } = useGetEditorRouter();
	const queryClient = useQueryClient();

	const streamChatMessage = ({
		messages,
		onComplete,
		onError,
		onStreamChunk,
		context = 'project',
		uploadId,
	}: {
		messages: { role: string; content: string }[];
		context?: ChatContext;
		uploadId?: string;
		onComplete: (response: string) => void;
		onStreamChunk: (chunk: string) => void;
		onError: (error: string) => void;
	}) => {
		const payload = JSON.stringify({
			messages,
			max_tokens: 2000,
			userId: user?.id,
			projectId,
			uploadId,
			context,
		});

		try {
			if (
				user.is_subscribed === false &&
				user.daily_free_token === freePlanLimits.dailyFreeToken
			) {
				toast.error(<ProPlanUpgradeToast target="AI" />, {
					style: reachedTokenLimitToastStyle,
				});
				return;
			}

			const source = new SSE('/api/chat', { payload });
			let cumulativeChunk = '';

			// Start Streaming
			source.addEventListener('message', async function (e) {
				const uint8Array = base64ToUint8Array(e.data);
				const eventMessage = new TextDecoder('utf-8').decode(uint8Array);
				if (eventMessage === '[DONE]') {
					source.close();
					onComplete(cumulativeChunk);

					queryClient.invalidateQueries({
						queryKey: [QKFreeAIToken],
					});
				} else {
					const chunkText = eventMessage;

					if (chunkText !== undefined) {
						onStreamChunk(chunkText);
						cumulativeChunk = cumulativeChunk + chunkText;
					}
				}
			});

			source.stream();

			return { stopStreaming: source.close as () => void };
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			console.log({ error });
			toast.error('Something went wrong. Please try again.');
		}
	};

	return { streamChatMessage };
};

export default useStreamChatMessage;
