import useLexicalEditorStore from '@context/lexicalEditor.store';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isAtNodeEnd } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import axios from 'axios';
import type {
	GridSelection,
	NodeKey,
	NodeSelection,
	RangeSelection,
} from 'lexical';
import {
	$createTextNode,
	$getNodeByKey,
	$getSelection,
	$isRangeSelection,
	$isTextNode,
	$setSelection,
	COMMAND_PRIORITY_LOW,
	KEY_ARROW_RIGHT_COMMAND,
	KEY_TAB_COMMAND,
} from 'lexical';
import { useCallback, useEffect } from 'react';

import { useSharedAutocompleteContext } from '../../context/SharedAutocompleteContext';
import {
	$createAutocompleteNode,
	AutocompleteNode,
} from '../../nodes/AutocompleteNode';
import { addSwipeRightListener } from '../../utils/swipe';

type SearchPromise = {
	dismiss: () => void;
	promise: Promise<null | string>;
};

export const uuid = Math.random()
	.toString(36)
	.replace(/[^a-z]+/g, '')
	.substr(0, 5);

function $search(
	selection: null | RangeSelection | NodeSelection | GridSelection,
): [boolean, string] {
	if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
		return [false, ''];
	}
	const node = selection.getNodes()[0];
	const anchor = selection.anchor;
	if (!$isTextNode(node) || !node.isSimpleText() || !$isAtNodeEnd(anchor)) {
		return [false, ''];
	}
	const text = node.getTextContent();
	const sentences = text.split('.').slice(-3); // get the last three sentences
	const prompt = sentences.join('. ').trim();
	return prompt.length > 0 ? [true, prompt] : [false, ''];
}

function useQuery(): (searchText: string) => SearchPromise {
	return useCallback((searchText: string) => {
		const server = new AutocompleteServer();
		return server.query(searchText);
	}, []);
}

export default function CopilotPlugin(): JSX.Element | null {
	const [editor] = useLexicalComposerContext();
	const [, setSuggestion] = useSharedAutocompleteContext();
	const query = useQuery();

	useEffect(() => {
		let autocompleteNodeKey: null | NodeKey = null;
		let lastMatch: null | string = null;
		let lastSuggestion: null | string = null;
		let searchPromise: null | SearchPromise = null;
		function $clearSuggestion() {
			const autocompleteNode =
				autocompleteNodeKey !== null
					? $getNodeByKey(autocompleteNodeKey)
					: null;
			if (autocompleteNode !== null && autocompleteNode.isAttached()) {
				autocompleteNode.remove();
				autocompleteNodeKey = null;
			}
			if (searchPromise !== null) {
				searchPromise.dismiss();
				searchPromise = null;
			}
			lastMatch = null;
			lastSuggestion = null;
			setSuggestion(null);
		}
		function updateAsyncSuggestion(
			refSearchPromise: SearchPromise,
			newSuggestion: null | string,
		) {
			if (searchPromise !== refSearchPromise || newSuggestion === null) {
				return;
			}
			try {
				editor.update(
					() => {
						const selection = $getSelection();
						const [hasMatch, match] = $search(selection);
						if (
							!hasMatch ||
							match !== lastMatch ||
							!$isRangeSelection(selection)
						) {
							return;
						}
						const selectionCopy = selection.clone();
						const node = $createAutocompleteNode(uuid);
						autocompleteNodeKey = node.getKey();
						selection.insertNodes([node]);
						$setSelection(selectionCopy);
						lastSuggestion = newSuggestion;
						setSuggestion(newSuggestion);
					},
					{ tag: 'history-merge' },
				);
			} catch (e) {
				console.error(e);
			}
		}

		function handleAutocompleteNodeTransform(node: AutocompleteNode) {
			const key = node.getKey();
			if (node.__uuid === uuid && key !== autocompleteNodeKey) {
				$clearSuggestion();
			}
		}
		function handleUpdate() {
			try {
				editor.update(() => {
					const selection = $getSelection();
					const [hasMatch, match] = $search(selection);
					if (!hasMatch) {
						$clearSuggestion();
						return;
					}

					if (
						match === lastMatch ||
						match === lastMatch + ' ' ||
						match === lastMatch + ',' ||
						match === lastMatch + '.' ||
						match === lastMatch + ';'
					) {
						return;
					}
					$clearSuggestion();
					searchPromise = query(match);
					searchPromise.promise
						.then(newSuggestion => {
							if (searchPromise !== null) {
								updateAsyncSuggestion(searchPromise, newSuggestion);
							}
						})
						.catch(e => {
							console.error(e);
						});
					lastMatch = match;
				});
			} catch (e) {
				console.error(e);
			}
		}

		function $handleAutocompleteIntent(): boolean {
			if (lastSuggestion === null || autocompleteNodeKey === null) {
				return false;
			}
			const autocompleteNode = $getNodeByKey(autocompleteNodeKey);
			if (autocompleteNode === null) {
				return false;
			}
			const textNode = $createTextNode(lastSuggestion);
			autocompleteNode.replace(textNode);
			textNode.selectNext();
			$clearSuggestion();
			return true;
		}
		function $handleKeypressCommand(e: Event) {
			if ($handleAutocompleteIntent()) {
				e.preventDefault();
				return true;
			}
			return false;
		}
		function handleSwipeRight(_force: number, e: TouchEvent) {
			editor.update(() => {
				if ($handleAutocompleteIntent()) {
					e.preventDefault();
				}
			});
		}
		function unmountSuggestion() {
			try {
				editor.update(() => {
					$clearSuggestion();
				});
			} catch (e) {
				console.error(e);
			}
		}

		const rootElem = editor.getRootElement();

		return mergeRegister(
			editor.registerNodeTransform(
				AutocompleteNode,
				handleAutocompleteNodeTransform,
			),
			editor.registerUpdateListener(handleUpdate),
			editor.registerCommand(
				KEY_TAB_COMMAND,
				$handleKeypressCommand,
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				KEY_ARROW_RIGHT_COMMAND,
				$handleKeypressCommand,
				COMMAND_PRIORITY_LOW,
			),
			...(rootElem !== null
				? [addSwipeRightListener(rootElem, handleSwipeRight)]
				: []),
			unmountSuggestion,
		);
	}, [query, setSuggestion]);

	return null;
}

class AutocompleteServer {
	LATENCY = 2000;

	query = (searchText: string): SearchPromise => {
		let isDismissed = false;

		const dismiss = () => {
			isDismissed = true;
		};
		const promise: Promise<null | string> = new Promise((resolve, reject) => {
			// Check if Autocomplete is off in the url params
			const { autocompleteOff } = useLexicalEditorStore.getState();

			if (autocompleteOff) {
				// If Autocomplete is off, do nothing
				return resolve(null);
			}

			const url = 'https://api.together.xyz/v1/chat/completions';
			const apiKey = process.env.NEXT_PUBLIC_TOGETHERAI_API_KEY;

			const headers = new Headers({
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			});

			const data = {
				model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
				max_tokens: 12,
				messages: [
					{
						role: 'system',
						content: 'You are an AI assistant',
					},
					{
						role: 'user',
						content:
							'Continue the following paragraph. Make sure to use proper punctuation:' +
							searchText,
					},
				],
			};

			const options = {
				method: 'POST',
				headers,
				body: JSON.stringify(data),
			};

			// Randomize the delay so that the suggestions feel a bit more natural.
			const delay = Math.random() * this.LATENCY + 1500;

			setTimeout(() => {
				if (isDismissed) {
					return reject('Dismissed');
				}
				const searchTextLength = searchText.length;
				if (searchText === '' || searchTextLength < 30) {
					return resolve(null);
				}

				fetch(url, options)
					.then(response => response.json())
					.then(result => {
						if (result.choices && result.choices.length > 0) {
							let completion = result.choices[0].message.content.trim();
							if (completion.charAt(0) !== ' ') {
								completion = ' ' + completion;
							}
							resolve(completion);
						}
					})
					.catch(error => {
						resolve(null);
						console.error('Error:', error);
					});
			}, delay);
		});

		return {
			dismiss,
			promise,
		};
	};
}

