import { Button } from '@components/ui/button';
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	EditorDialog,
} from '@components/ui/editor-dialog';
import { Input } from '@components/ui/input';
import { useUser } from '@context/user';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
	LexicalTypeaheadMenuPlugin,
	useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { ReloadIcon } from '@radix-ui/react-icons';
import useCreateNote from '@resources/notes';
import { updateTokenUsageForFreeTier } from '@resources/updateTokenUsageForFreeTier';
import { base64ToUint8Array } from '@utils/base64ToUint8Array';
import { useCompletion } from 'ai/react';
import { $createTextNode, $getSelection } from 'lexical';
import { ArrowDownSquare, Clipboard, Save } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'sonner';

const ResearchQuestionPlugin = () => {
	const [editor] = useLexicalComposerContext();
	const [queryString, setQueryString] = useState(null);
	const { user } = useUser();
	const language = user?.editor_language;
	const triggerMatch = useBasicTypeaheadTriggerMatch('#', {
		minLength: 0,
	});

	const [researchQuestion, setResearchQuestion] = useState<string>('');
	const [answer, setAnswer] = useState<string>('');
	const [showModal, setShowModal] = useState<boolean>(true);
	const { mutateAsync: createNote } = useCreateNote();
	const [isQuestionSubmitted, setIsQuestionSubmitted] =
		useState<boolean>(false);

	const {
		completion,
		input,
		stop,
		isLoading,
		handleInputChange,
		handleSubmit,
	} = useCompletion({
		api: '/api/answer-research-question',
		body: { userId: user?.id, editorLanguage: language },
		onResponse: () => {
			setShowModal(true);
			setIsQuestionSubmitted(true);
		},
	});

	const onModalClose = cleanUp => {
		stop(); // Call abort function when closing the modal
		setAnswer('');
		setIsQuestionSubmitted(false);
		cleanUp();
	};

	const onSelectOption = useCallback(
		(selectedOption, nodeToRemove, closeMenu, matchingString) => {
			editor.update(() => {
				if (nodeToRemove) {
					nodeToRemove.remove();
				}
				closeMenu();
			});
		},
		[editor],
	);

	const copyToClipboard = (answer: string) => {
		navigator.clipboard.writeText(answer); //T-75 decide what type of content we want to copy
		toast.success('Copied');
	};

	const onCopyClick = useCallback(
		() => copyToClipboard(completion),
		[completion],
	);

	const saveToNotes = async cleanup => {
		createNote(completion);
		onModalClose(cleanup);
	};

	return (
		<>
			{/* Typeahead Menu Plugin */}
			<LexicalTypeaheadMenuPlugin
				options={[]}
				onQueryChange={setQueryString}
				onSelectOption={onSelectOption}
				triggerFn={triggerMatch}
				menuRenderFn={(
					anchorElementRef,
					{ selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
				) =>
					anchorElementRef.current
						? ReactDOM.createPortal(
								<>
									<EditorDialog
										defaultOpen
										onOpenChange={() => onModalClose(selectOptionAndCleanUp)}
									>
										{!isQuestionSubmitted ? (
											<DialogContent>
												<DialogTitle>Ask a research question</DialogTitle>
												<form onSubmit={handleSubmit}>
													<Input
														onChange={e => {
															setResearchQuestion(e.target.value),
																handleInputChange(e);
														}}
														placeholder="Type your research question here..."
													/>
												</form>
												<DialogFooter>
													{isLoading ? (
														<Button disabled>
															<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
															Loading...
														</Button>
													) : (
														<Button variant="outline" type="submit">
															Ask question
														</Button>
													)}
												</DialogFooter>
											</DialogContent>
										) : (
											<DialogContent>
												<DialogTitle>{researchQuestion}</DialogTitle>

												<DialogDescription className="text-muted-foreground">
													Isaac can make mistakes. Consider checking important
													information.
												</DialogDescription>

												<div className="overflow-y-auto prose max-h-[400px] w-full whitespace-pre-wrap">
													{completion}
												</div>

												<DialogFooter>
													<div className="w-full inline-flex justify-between items-center">
														<div className="inline-flex gap-2">
															<Button
																onClick={() => {
																	editor.update(() => {
																		const selection = $getSelection();
																		selection.insertNodes([
																			$createTextNode(completion),
																		]);
																	}),
																		onModalClose(selectOptionAndCleanUp);
																}}
																variant="outline"
																size="sm"
															>
																<ArrowDownSquare size={16} className="mr-2" />
																Paste
															</Button>
															<Button
																onClick={onCopyClick}
																variant="outline"
																size="sm"
															>
																<Clipboard size={16} className="mr-2" />
																Copy
															</Button>
														</div>

														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																saveToNotes(selectOptionAndCleanUp)
															}
														>
															<Save size={16} className="mr-2 " />
															Save
														</Button>
													</div>
												</DialogFooter>
											</DialogContent>
										)}
									</EditorDialog>
								</>,
								anchorElementRef.current,
						  )
						: null
				}
			/>
		</>
	);
};

export default ResearchQuestionPlugin;
