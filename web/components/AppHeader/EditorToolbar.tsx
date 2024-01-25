import { Button } from '@components/ui/button';
import useLexicalEditorStore from '@context/lexicalEditor.store';

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@components/ui/tooltip';
import { TabType } from '@hooks/useDocumentTabs';
import { mergeRegister } from '@lexical/utils';
import {
	$getRoot,
	CAN_REDO_COMMAND,
	CAN_UNDO_COMMAND,
	COMMAND_PRIORITY_LOW,
	REDO_COMMAND,
	UNDO_COMMAND,
} from 'lexical';
import { Download, Redo, Undo } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type EditorToolbarProps = {
  activeTabType: TabType;
};

const EditorToolbar: React.FC<EditorToolbarProps> = ({ activeTabType }) => {
	const { activeEditor } = useLexicalEditorStore();
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	const exportAsText = () => {
		const rawTextContent = activeEditor
			.getEditorState()
			.read(() => $getRoot().getTextContent());
		const blob = new Blob([rawTextContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		Object.assign(link, {
			href: url,
			download: 'document.txt',
		});

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	};

	useEffect(() => {
		if (!activeEditor) 	return;
		return mergeRegister(
			activeEditor?.registerCommand(
				CAN_UNDO_COMMAND,
				payload => {
					setCanUndo(payload);
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
			activeEditor?.registerCommand(
				CAN_REDO_COMMAND,
				payload => {
					setCanRedo(payload);
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [activeEditor]);
	return (
		<div className="border-b border-r h-8 px-2">
			<Button
				variant="ghost"
				size="icon"
				className="relative h-6 w-6 text-accent-foreground"
				disabled={!canUndo || activeTabType != 'Document'}
				onClick={() => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					activeEditor?.dispatchCommand(UNDO_COMMAND);
				}}
				aria-label="Undo"
			>
				<Undo size={20} strokeWidth={1.2} />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				disabled={!canRedo || activeTabType != 'Document'}
				onClick={() => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					activeEditor?.dispatchCommand(REDO_COMMAND);
				}}
				className="relative h-8 w-8 text-accent-foreground"
				aria-label="Redo"
			>
				<Redo size={20} strokeWidth={1.2} />
			</Button>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						onClick={exportAsText}
						disabled={activeTabType!="Document"}
						className="relative h-6 w-6 text-accent-foreground"
					>
						<Download size={20} strokeWidth={1.2} />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="right">
					<p>Download document as .txt file</p>
				</TooltipContent>
			</Tooltip>
		</div>
	);
};

export default EditorToolbar;
