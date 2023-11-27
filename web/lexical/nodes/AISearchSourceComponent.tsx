import { cn } from '@components/lib/utils';
import LiteratureCard from '@components/literature/LiteratureCard';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardFooter } from '@components/ui/card';

import useAIAssistantStore from '@context/aiAssistant.store';
import useAddReference from '@hooks/api/useAddToReference';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { $isAIOutputNode } from '@lexical/nodes/AIOutputNode';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { motion } from 'framer-motion';
import {
	$createTextNode,
	$getNodeByKey,
	$getSelection,
	$isRangeSelection,
	$setSelection,
} from 'lexical';
import { Check, Trash } from 'lucide-react';
import { useCallback } from 'react';
import { LiteratureSource } from 'types/chat';
import { ReferenceType } from 'types/literatureReference.type';
import { $createCitationNode } from './CitationNode';

type CardProps = React.ComponentProps<typeof Card>;

interface AISearchSourceComponentProps extends CardProps {
	nodeKey: string; // Add custom properties here
}

const AISearchSourceComponent = ({
	className,
	nodeKey,
	...props
}: AISearchSourceComponentProps) => {
	const literatures = useAIAssistantStore(
		state => state.literatureReferenceOutput,
	);
	const { projectId } = useGetEditorRouter();
	const [editor] = useLexicalComposerContext();
	const cachedSelection = useAIAssistantStore(state => state.cachedSelection);
	const { setAITextOutput } = useAIAssistantStore(state => state.actions);
	const { mutateAsync: addToReference } = useAddReference();

	// Instead
	const acceptText = () => {
		editor.focus();

		editor.update(() => {
			$setSelection(cachedSelection);
			const selection = $getSelection();

			if (!$isRangeSelection(selection)) {
				console.log('not range selection');
				return;
			}

			// TODO: Insert citation node instead
			// const aISearchSourceNode = $createTextNode(AISearchSource.trim());
			// selection.insertNodes([aISearchSourceNode]);

			const node = $getNodeByKey(nodeKey);

			if ($isAIOutputNode(node)) {
				node.remove();
				setAITextOutput('');
			}
		});
	};

	const handleApply = async (lit: LiteratureSource) => {
		//
		editor.focus();
		const data = await addToReference({ projectId, papers: [lit] });
		console.log({ data });
		editor.update(() => {
			$setSelection(cachedSelection);
			const selection = $getSelection();

			if (!$isRangeSelection(selection)) {
				return;
			}
			// TODO: Insert citation node instead
			// const citationNode = $createCitationNode({id:});
			// selection.insertNodes([aISearchSourceNode]);

			const node = $getNodeByKey(nodeKey);

			if ($isAIOutputNode(node)) {
				node.remove();
				setAITextOutput('');
			}
		});
	};

	const discard = useCallback(() => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);

			if ($isAIOutputNode(node)) {
				node.remove();
				setAITextOutput('');
			}
		});
	}, [editor, nodeKey, setAITextOutput]);

	return (
		<motion.div
			onClick={e => e.stopPropagation()}
			initial={{ opacity: 0.5, y: 5, scaleX: 0.9, scaleY: 0.7 }}
			animate={{ opacity: 1, y: 0, scaleX: 1, scaleY: 1 }}
			transition={{ duration: 0.5, ease: 'easeInOut' }}
		>
			<Card
				className={cn(
					'w-full bg-transparent shadow-none mt-4 mx-0 border-isaac/20',
					className,
				)}
				{...props}
			>
				<CardContent className="grid gap-4">
					<div className="flex flex-col gap-2 items-center rounded-md border-none">
						<p> Sources:</p>
						{literatures?.map((lit, idx) => (
							<LiteratureCard
								key={lit.doi}
								source="Search"
								displayCta
								title={lit.title}
								authors={lit.authors.map(i => i.name)}
								year={lit.year}
								type={ReferenceType.ARTICLE}
								onClick={() => ''}
								onAdd={() => addToReference({ projectId, papers: [lit] })}
								onApply={() => handleApply(lit)}
							/>
						))}
					</div>
				</CardContent>
				<CardFooter className="inline-flex items-center gap-2">
					<Button onClick={discard} variant="ghost">
						<Trash className="mr-1 h-4 w-4" size={20} strokeWidth={1.2} />{' '}
						<span> Close</span>
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
};

export default AISearchSourceComponent;
