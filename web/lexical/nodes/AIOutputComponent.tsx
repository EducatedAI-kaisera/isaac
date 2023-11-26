import { BellIcon, CheckIcon } from '@radix-ui/react-icons';

import { cn } from '@components/lib/utils';
import { Button } from '@components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@components/ui/card';

import useAIAssistantStore from '@context/aiAssistant.store';
import { $isAIOutputNode } from '@lexical/nodes/AIOutputNode';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { motion } from 'framer-motion';
import {
	$createTextNode,
	$getNodeByKey,
	$getSelection,
	$isRangeSelection,
	$setSelection,
	NodeKey,
} from 'lexical';
import { Check, Trash } from 'lucide-react';
import { useCallback } from 'react';

const notifications = [
	{
		title: 'Your call has been confirmed.',
		description: '1 hour ago',
	},
	{
		title: 'You have a new message!',
		description: '1 hour ago',
	},
	{
		title: 'Your subscription is expiring soon!',
		description: '2 hours ago',
	},
];

type CardProps = React.ComponentProps<typeof Card>;

interface AIOutputComponentProps extends CardProps {
	nodeKey: string; // Add custom properties here
}

const AIOutputComponent = ({
	className,
	nodeKey,
	...props
}: AIOutputComponentProps) => {
	const AIOutput = useAIAssistantStore(state => state.AIOutput);
	const [editor] = useLexicalComposerContext();
	const cachedSelection = useAIAssistantStore(state => state.cachedSelection);
	const setAIOutput = useAIAssistantStore(state => state.setAIOutput);

	const acceptText = () => {
		editor.focus();

		editor.update(() => {
			$setSelection(cachedSelection);
			const selection = $getSelection();

			if (!$isRangeSelection(selection)) {
				console.log('not range selection');
				return;
			}

			const aiOutputNode = $createTextNode(AIOutput.trim());

			selection.insertNodes([aiOutputNode]);

			const node = $getNodeByKey(nodeKey);

			if ($isAIOutputNode(node)) {
				node.remove();
				setAIOutput('');
			}
		});
	};

	const discard = useCallback(() => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);

			if ($isAIOutputNode(node)) {
				node.remove();
				setAIOutput('');
			}
		});
	}, [editor, nodeKey, setAIOutput]);

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
					<div className="flex items-center rounded-md border-none">
						<p>{AIOutput}</p>
					</div>
				</CardContent>
				<CardFooter className="inline-flex items-center gap-2">
					<Button
						className="inline-flex items-center"
						variant="outline"
						onClick={acceptText}
					>
						<Check className="mr-1 h-4 w-4" size={20} strokeWidth={1.2} />
						<span>Replace selection </span>
					</Button>
					<Button onClick={discard} variant="ghost">
						<Trash className="mr-1 h-4 w-4" size={20} strokeWidth={1.2} />{' '}
						<span> Discard</span>
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
};

export default AIOutputComponent;
