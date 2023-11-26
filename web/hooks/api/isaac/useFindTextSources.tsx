import useChatStore from '@context/chat.store';
import { Panel, useUIStore } from '@context/ui.store';
import { useUser } from '@context/user';
import useSaveMessageToDatabase from '@hooks/api/isaac/useSaveMessageToDatabase';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { LiteratureResponse } from '@resources/literature.api';
import mixpanel from 'mixpanel-browser';
import { ChatMessage, LiteratureSource } from 'types/chat';
import { v4 as uuidv4 } from 'uuid';

const useFindTextSources = () => {
	const openPanel = useUIStore(s => s.openPanel);
	const { user } = useUser();
	const { projectId } = useGetEditorRouter();
	const { addNewMessages, updateSourcesMessage } = useChatStore();
	const { saveMessageToDatabase } = useSaveMessageToDatabase();

	const findSources = async (text: string) => {
		mixpanel.track('Searched Sources');
		openPanel(Panel.CHAT);
		// Prevent re-rendering of component and subsequent loss of messages in state by adding a delay
		// TODO: Find a better way to solve this issue
		await new Promise(resolve => setTimeout(resolve, 500));

		// TODO: consider language
		// const prompt = manipulateTextMap[method]?.promptBuilder(text);
		const userMessageObj: ChatMessage = {
			id: uuidv4(),
			user_id: user?.id,
			project_id: projectId,
			content: `${text}`,
			metadata: {
				role: 'user',
				type: 'manipulation',
				manipulation_title: 'Find academic sources for the following passage:',
			},
		};
		const assistantMessageId = uuidv4();
		const assistantMessageObj: ChatMessage = {
			id: assistantMessageId,
			user_id: user?.id,
			project_id: projectId,
			content: '',
			metadata: {
				role: 'assistant',
				type: 'regular',
			},
		};

		addNewMessages([userMessageObj, assistantMessageObj]);

		const response = await fetch('/api/find-sources', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ input: window.getSelection().toString() }),
		});

		const data = (await response.json()) as LiteratureResponse;

		const sources: LiteratureSource[] = data.literature?.map(lit => ({
			title: lit.title,
			url: lit.url,
			paperId: lit.paperId,
			authors: lit.authors,
			year: lit.year,
			doi: lit.externalIds.DOI,
		}));

		const updatedMessage = updateSourcesMessage(sources, assistantMessageId);
		await saveMessageToDatabase(userMessageObj);
		await saveMessageToDatabase(updatedMessage);
	};

	return { findSources };
};

export default useFindTextSources;
