import useAIAssistantStore from '@context/aiAssistant.store';
import useLexicalEditorStore from '@context/lexicalEditor.store';
import { Panel, useUIStore } from '@context/ui.store';
import { useUser } from '@context/user';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { $createAIOutputNode } from '@lexical/nodes/AIOutputNode';
import { LiteratureResponse } from '@resources/literature.api';
import { $getSelection, $isRangeSelection } from 'lexical';
import mixpanel from 'mixpanel-browser';
import { useCallback } from 'react';
import { LiteratureSource } from 'types/chat';

const useFindTextSources = () => {
	const openPanel = useUIStore(s => s.openPanel);
	const { user } = useUser();
	const { projectId } = useGetEditorRouter();
	const editor = useLexicalEditorStore(s => s.activeEditor);
	const {
		setLiteratureReferenceOutput,
		setLiteratureReferenceOutputLoading,
		setCachedSelection,
	} = useAIAssistantStore(state => state.actions);

	const insertAIOutputComponent = useCallback(() => {
		editor.update(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection)) {
				return;
			}
			setCachedSelection(selection.clone());
			const aiOutputNode = $createAIOutputNode('source-output');
			const focusedNode = selection.focus.getNode();
			focusedNode.insertAfter(aiOutputNode, true);
		});
		setLiteratureReferenceOutputLoading(true);
	}, [editor]);

	const findSources = async (text: string) => {
		mixpanel.track('Searched Sources');
		openPanel(Panel.CHAT);
		insertAIOutputComponent();

		// TODO: consider language
		// const prompt = manipulateTextMap[method]?.promptBuilder(text);

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

		setLiteratureReferenceOutput(sources);
	};

	return { findSources };
};

export default useFindTextSources;
