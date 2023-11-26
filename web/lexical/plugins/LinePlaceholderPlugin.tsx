import {
	$getSelection,
	$isElementNode,
	$isParagraphNode,
	$isRangeSelection,
	$isRootNode,
	$isTextNode,
	COMMAND_PRIORITY_LOW,
	ElementNode,
	RangeSelection,
	SELECTION_CHANGE_COMMAND,
	TextNode,
} from 'lexical';
import { useCallback, useEffect } from 'react';

import { $isImageNode } from '@lexical/nodes/ImageNode';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { getSelectedNode } from '../utils/getSelectedNode';

import { commandKey } from '@lexical/utils/meta';

export const LinePlaceholderPlugin = () => {
	const [editor] = useLexicalComposerContext();

	const updateCursorPosition = useCallback((): boolean => {
		const selection = $getSelection();

		if (selection && $isRangeSelection(selection)) {
			const rangeSelection = selection as RangeSelection;
			const node = getSelectedNode(rangeSelection);

			if (node) {
				const isParagraph = $isParagraphNode(node) || $isTextNode(node);

				if (isParagraph) {
					displayPlaceholder(node);
				}
			}
		}

		return false;
	}, [editor]);

	// Helper function to display placeholder
	const displayPlaceholder = (node: ElementNode | TextNode) => {
		const text = node.getTextContent();
		const element = editor.getElementByKey(node.getKey());
		const placeholder = document.querySelector(
			'.editor-placeholder',
		) as HTMLElement;
		const parentNode = node.getParent();
		const parentIsRoot = $isRootNode(parentNode);
		// inspecting image
		let childHasImageNode = false;
		if ($isElementNode(node)) {
			const childNodes = node?.getChildren() || [];
			childHasImageNode = !!childNodes.find(node => $isImageNode(node));
		}
		if (!text && parentIsRoot && !childHasImageNode) {
			positionPlaceholder(placeholder, element);
		} else {
			hidePlaceholder(placeholder);
		}
	};

	// Helper function to position the placeholder
	const positionPlaceholder = (placeholder, element) => {
		const rect = element.getBoundingClientRect();
		const parentRect = placeholder.parentElement.getBoundingClientRect();
		const top = rect.y - parentRect.y;
		const left = rect.x - parentRect.x;

		placeholder.style.top = `${top}px`;
		placeholder.style.left = `${left}px`;
		placeholder.style.opacity = '1';
	};

	// Helper function to hide the placeholder
	const hidePlaceholder = placeholder => {
		placeholder.style.top = '-10000px';
		placeholder.style.left = '-10000px';
		placeholder.style.opacity = '0';
	};

	// Change current editor content
	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			updateCursorPosition,
			COMMAND_PRIORITY_LOW,
		);
	}, [editor]);

	return (
		<div className="editor-placeholder">
			<strong>{commandKey} + K</strong> to insert a command
		</div>
	);
};
