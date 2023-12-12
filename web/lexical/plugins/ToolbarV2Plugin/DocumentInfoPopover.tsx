import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@components/ui/popover';
import { CitationNode } from '@lexical/nodes/CitationNode';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $nodesOfType, COMMAND_PRIORITY_LOW } from 'lexical';
import React, { ReactNode, useEffect, useState } from 'react';

type Props = {
	children: ReactNode;
};

const DocumentInfoPopover = ({ children }: Props) => {
	const [wordCount, setWordCount] = useState(0);
	const [characterCount, setCharacterCount] = useState(0);
	const [citationCount, setCitationCount] = useState(0);
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const text = $getRoot().getTextContent();
				setCharacterCount(text.length);
				setWordCount(text.split(' ').length);
				const citationNodes = $nodesOfType(CitationNode);
				setCitationCount(citationNodes.length);
			});
		});
	}, []);

	return (
		<Popover>
			<PopoverTrigger>{children}</PopoverTrigger>
			<PopoverContent side="left" className="text-sm w-[200px]">
				<p className="font-bold mb-2">Document Info</p>
				<div className="flex flex-col gap-1">
					<p className="">Word Count: {wordCount}</p>
					<p>Character Count: {characterCount}</p>
					<p>Citations: {citationCount}</p>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default DocumentInfoPopover;
