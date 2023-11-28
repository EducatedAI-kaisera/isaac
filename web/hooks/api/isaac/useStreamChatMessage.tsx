import { useUser } from '@context/user';
import { QKFreeAIToken } from '@hooks/api/useFreeTierLimit.get';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import toast from 'react-hot-toast';
import { useQueryClient } from 'react-query';
import { SSE } from 'sse.js';
import { ChatContext } from 'types/chat';

const useStreamChatMessage = () => {
	const { user } = useUser();
	const { projectId } = useGetEditorRouter();
	const queryClient = useQueryClient();

	const streamChatMessage = ({
		messages,
		onComplete,
		onStreamChunk,
		context = 'project',
		uploadId,
	}: {
		messages: { role: string; content: string }[];
		context?: ChatContext;
		uploadId?: string;
		onComplete: (response: string) => void;
		onStreamChunk: (chunk: string) => void;
	}) => {
		const payload = JSON.stringify({
			messages,
			max_tokens: 2000,
			userId: user?.id,
			projectId,
			uploadId,
			context,
		});
		const source = new SSE(`/api/chat`, { payload });
		let cumulativeChunk = '';

		// Start Streaming
		try {
			source.addEventListener('message', async function (e) {
				if (e.data === '[DONE]') {
					source.close();
					onComplete(cumulativeChunk);

					queryClient.invalidateQueries([QKFreeAIToken]);
				} else {
					console.log({ data: e.data });
					const payload = JSON.parse(e.data);
					const chunkText = payload.choices[0].delta.content;

					if (chunkText !== undefined) {
						onStreamChunk(chunkText);
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

	return { streamChatMessage };
};

export default useStreamChatMessage;
