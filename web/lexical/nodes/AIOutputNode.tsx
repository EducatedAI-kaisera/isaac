import type {
	DOMExportOutput,
	EditorConfig,
	LexicalEditor,
	LexicalNode,
	NodeKey,
	SerializedLexicalNode,
	Spread,
} from 'lexical';

import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import dynamic from 'next/dynamic';
import * as React from 'react';

const AIOutputComponent = dynamic(() => import('./AIOutputComponent'), {
	ssr: false,
});

export type SerializedAIOutputNode = Spread<
	{
		type: 'ai-output';
	},
	SerializedLexicalNode
>;

export class AIOutputNode extends DecoratorNode<JSX.Element> {
	static getType(): string {
		return 'ai-output';
	}

	static clone(node: AIOutputNode): AIOutputNode {
		return new AIOutputNode(node.__key);
	}

	constructor(key?: NodeKey) {
		super(key);
	}

	static importJSON() {
		const node = $createAIOutputNode();
		return node;
	}

	exportJSON(): SerializedAIOutputNode {
		return {
			type: 'ai-output',
			version: 1,
		};
	}

	createDOM(_config: EditorConfig): HTMLElement {
		return document.createElement('div');
	}

	exportDOM(editor: LexicalEditor): DOMExportOutput {
		const element = document.createElement('div');
		element.setAttribute('data-lexical-decorator', 'true');
		return { element };
	}

	updateDOM(prevNode: AIOutputNode): boolean {
		// If the inline property changes, replace the element
		return this.__inline !== prevNode.__inline;
	}

	// Responsible for rendering component
	decorate(): JSX.Element {
		return <AIOutputComponent nodeKey={this.getKey()} />;
	}
}
export function $createAIOutputNode() {
	const AIOutputNode_ = new AIOutputNode();

	return $applyNodeReplacement(AIOutputNode_);
}

export function $isAIOutputNode(
	node: LexicalNode | null | undefined,
): node is AIOutputNode {
	return node instanceof AIOutputNode;
}

export function $deleteAIOutputNode(
	node: LexicalNode,
): null | undefined | LexicalNode {
	if ($isAIOutputNode(node)) {
		return null;
	}
}
