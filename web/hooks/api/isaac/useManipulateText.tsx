import {
	ProPlanUpgradeToast,
	reachedTokenLimitToastStyle,
} from '@components/toast/ProPlanUpgradToast';
import useAIAssistantStore from '@context/aiAssistant.store';
import useLexicalEditorStore from '@context/lexicalEditor.store';
import { useUser } from '@context/user';
import useIsaacSystemPrompt from '@hooks/api/isaac/useIsaacSystemPrompt';
import useAIOutput from '@hooks/api/useAIOutput';
import { QKFreeAIToken } from '@hooks/api/useFreeTierLimit.get';
import { $createAIOutputNode } from '@lexical/nodes/AIOutputNode';
import { useLocalStorage } from '@mantine/hooks';
import {
	manipulateTextMap,
	ManipulateTextMethods,
} from '@utils/manipulateTextMap';
import { AIModelLocalStorageKey } from 'data/aiModels.data';
import { freePlanLimits } from 'data/pricingPlans';
import {
	$createParagraphNode,
	$getSelection,
	$insertNodes,
	$isParagraphNode,
	$isRangeSelection,
	$isRootOrShadowRoot,
	$isTextNode,
	$setSelection,
	ElementNode,
	FORMAT_TEXT_COMMAND,
	INSERT_LINE_BREAK_COMMAND,
	LexicalNode,
	TextFormatType,
	TextNode,
} from 'lexical';
import mixpanel from 'mixpanel-browser';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from 'react-query';
import { SSE } from 'sse.js';

const useManipulationText = () => {
	const { user } = useUser();
	const language = user?.editor_language;
	const queryClient = useQueryClient();
	const [llmModel] = useLocalStorage({ key: AIModelLocalStorageKey });
	const editor = useLexicalEditorStore(s => s.activeEditor);
	const systemPrompt = useIsaacSystemPrompt();
	const { streamAIOutput, createNewAIOutput } = useAIOutput();
	const setAIOutput = useAIAssistantStore(state => state.setAIOutput);
	const setCachedSelection = useAIAssistantStore(
		state => state.setCachedSelection,
	);

	const insertAIOutputComponent = useCallback(() => {
		editor.update(() => {
			const selection = $getSelection();
			setCachedSelection(selection.clone());

			if (!$isRangeSelection(selection)) {
				return;
			}

			const aiOutputNode = $createAIOutputNode();

			const focusedNode = selection.focus.getNode();

			focusedNode.insertAfter(aiOutputNode, true);
		});
	}, [editor]);

	const manipulateText = async (
		text: string,
		method: ManipulateTextMethods,
		additionalContext?: string,
	) => {
		mixpanel.track(manipulateTextMap[method].mixpanelTrack);

		if (
			user.is_subscribed === false &&
			user.daily_free_token === freePlanLimits.dailyFreeToken
		) {
			toast.error(<ProPlanUpgradeToast target="AI" />, {
				style: reachedTokenLimitToastStyle,
			});
			return;
		}

		// openPanel(Panel.AI_OUTPUT_LOGS);

		insertAIOutputComponent();

		const prompt = manipulateTextMap[method]?.promptBuilder({
			selection: text,
			editorLanguage: language,
			additionalContext,
		});

		const aiOutputEntry = createNewAIOutput(method, text);
		const source = new SSE(
			`${manipulateTextMap[method].endpoint}?userId=${
				user?.id
			}&systemPrompt=${systemPrompt}&llmModel=${llmModel || 'gpt-3.5-turbo'}`,

			{
				payload: prompt,
			},
		);

		let cumulativeChunk = '';

		// Start Streaming
		try {
			source.addEventListener('message', async function (e) {
				if (e.data === '[DONE]') {
					source.close();

					queryClient.invalidateQueries([QKFreeAIToken]);
				} else {
					const payload = JSON.parse(e.data);
					const chunkText = payload.choices[0].delta.content;

					if (chunkText !== undefined) {
						// streamAIOutput(aiOutputEntry.id, chunkText);
						setAIOutput(cumulativeChunk + chunkText);
						// addNewStreamingMessage(chunkText, assistantMessageObj.id);
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
function $wrapNodeInElement(
	imageNode: LexicalNode,
	$createParagraphNode: () => import('lexical').ParagraphNode,
) {
	throw new Error('Function not implemented.');
}
