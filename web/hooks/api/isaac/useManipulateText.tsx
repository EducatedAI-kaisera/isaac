import {
	ProPlanUpgradeToast,
	reachedTokenLimitToastStyle,
} from '@components/toast/ProPlanUpgradToast';
import useAIAssistantStore from '@context/aiAssistant.store';
import useLexicalEditorStore from '@context/lexicalEditor.store';
import { useUser } from '@context/user';
import useIsaacSystemPrompt from '@hooks/api/isaac/useIsaacSystemPrompt';
import { QKFreeAIToken } from '@hooks/api/useFreeTierLimit.get';
import { $createAIOutputNode } from '@lexical/nodes/AIOutputNode';
import { useLocalStorage } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { base64ToUint8Array } from '@utils/base64ToUint8Array';
import {
	manipulateTextMap,
	ManipulateTextMethods,
} from '@utils/manipulateTextMap';
import { AIModelLocalStorageKey } from 'data/aiModels.data';
import { freePlanLimits } from 'data/pricingPlans';
import { $getSelection, $isRangeSelection } from 'lexical';
import mixpanel from 'mixpanel-browser';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { SSE } from 'sse.js';

const useManipulationText = () => {
	const { user } = useUser();
	const language = user?.editor_language;
	const queryClient = useQueryClient();
	const [llmModel] = useLocalStorage({ key: AIModelLocalStorageKey });
	const editor = useLexicalEditorStore(s => s.activeEditor);
	const systemPrompt = useIsaacSystemPrompt();
	const { setAITextOutput, setCachedSelection, setOpen, setAIOperation } =
		useAIAssistantStore(state => state.actions);

	const insertAIOutputComponent = useCallback(() => {
		editor.update(() => {
			const selection = $getSelection();

			if (!$isRangeSelection(selection)) {
				return;
			}

			setCachedSelection(selection.clone());
			const aiOutputNode = $createAIOutputNode('text');
			const focusedNode = selection.focus.getNode();
			focusedNode.insertAfter(aiOutputNode, true);
			setOpen(true);
		});
	}, [editor]);

	const manipulateText = async (
		text: string,
		method: ManipulateTextMethods,
		additionalContext?: string,
	) => {
		mixpanel.track(manipulateTextMap[method].mixpanelTrack);
		setAIOperation(method);

		if (
			user.is_subscribed === false &&
			user.daily_free_token === freePlanLimits.dailyFreeToken
		) {
			toast.error(<ProPlanUpgradeToast target="AI" />, {
				style: reachedTokenLimitToastStyle,
			});
			return;
		}

		insertAIOutputComponent();

		const prompt = manipulateTextMap[method]?.promptBuilder({
			selection: text,
			editorLanguage: language,
			additionalContext,
		});

		const source = new SSE(
			`${manipulateTextMap[method].endpoint}?userId=${
				user?.id
			}&systemPrompt=${systemPrompt}&llmModel=${llmModel || 'gpt-3.5-turbo'}`,

			{
				payload: JSON.stringify(prompt),
			},
		);

		let cumulativeChunk = '';

		// Start Streaming
		try {
			source.addEventListener('message', async function (e) {
				const uint8Array = base64ToUint8Array(e.data);
				const eventMessage = new TextDecoder('utf-8').decode(uint8Array);

				if (eventMessage === '[DONE]') {
					source.close();

					queryClient.invalidateQueries({
						queryKey: [QKFreeAIToken],
					});
				} else {
					const chunkText = eventMessage;

					if (chunkText !== undefined) {
						setAITextOutput(cumulativeChunk + chunkText);
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

	return { manipulateText };
};

export default useManipulationText;
