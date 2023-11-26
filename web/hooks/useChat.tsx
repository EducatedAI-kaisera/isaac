import {
	ProPlanUpgradeToast,
	reachedTokenLimitToastStyle,
} from '@components/toast/ProPlanUpgradToast';
import useChatStore from '@context/chat.store';
import { useUser } from '@context/user';
import useIsaacSystemPrompt from '@hooks/api/isaac/useIsaacSystemPrompt';
import { getChatMessagesByUserIdAndProjectId } from '@hooks/api/useGetChatMessages';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { estimateTokens } from '@utils/estimateTokens';

import useSaveMessageToDatabase from '@hooks/api/isaac/useSaveMessageToDatabase';
import { QKFreeAIToken } from '@hooks/api/useFreeTierLimit.get';
import { useLocalStorage } from '@mantine/hooks';
import { AIModelLocalStorageKey } from 'data/aiModels.data';
import { isaacStatusMessages } from 'data/isaac';
import { debounce } from 'lodash';
import { createRef, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { SSE } from 'sse.js';
import { ChatContext, ChatMessage } from 'types/chat';
import { ChatGPTMessage } from 'types/openai';
import { v4 as uuidv4 } from 'uuid';

const retrieveChatContext = async (
	userMessage: string,
	userId: string,
	projectId: string,
) => {
	try {
		const response = await fetch('/api/embeddings-hybrid-search', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				query: userMessage,
				user_id: userId,
				project_id: projectId,
			}),
		});
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error:', error);
	}
};

interface Exposed {
	/* Refs */
	scrollRef: React.RefObject<HTMLDivElement>;
	/* States */
	inputValue: string;
	searchInputValue: string;
	messages: ChatMessage[];
	isRegenerateSeen: boolean;
	isLoading: boolean;
	isSearchOpen: boolean;
	isSearching: boolean;
	isSearchActive: boolean;
	isSettingsOpen: boolean;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	/* Setters */
	setInputValue: (value: string) => void;
	setSearchInputValue: (value: string) => void;
	setIsSearchOpen: (value: boolean) => void;
	setIsSearching: (value: boolean) => void;
	setIsSettingsOpen: (value: boolean) => void;
	/* Handlers */
	submitHandler: (e: React.FormEvent<HTMLFormElement>) => void;
	regenerateHandler: () => void;
	cancelHandler: () => void;
	fetchNextPage: () => void;
	/* Errors */
	initialMessagesError: any;
}

const useChat = () => {
	// STORES
	const { user } = useUser();
	const {
		messages,
		activeFileReference,
		chatContext,
		temperature,
		isHandling,
		setIsHandling,
		setStatusMessage,
		setInitialMessages,
		deleteAILastMessage,
		addNewMessages,
		addNewFootnotes,
		addNewStreamingMessage,
		deleteUserLastMessageAndReturnID,
	} = useChatStore();
	const language = user?.editor_language;
	const queryClient = useQueryClient();
	const isaacSystemPrompt = useIsaacSystemPrompt();

	// REFS
	const scrollRef = useMemo(() => createRef<HTMLDivElement>(), []);

	// STATES
	const [inputValue, setInputValue] = useState('');
	const [searchInputValue, setSearchInputValue] = useState('');
	const [debouncedSearchInput, setDebouncedSearchInput] =
		useState(searchInputValue);

	const languagePrompt = `Based on the previously provided context please answer the following user message in ${language}:`;
	const systemPrompt = useMemo<ChatGPTMessage>(
		() => ({
			role: 'system',
			content: isaacSystemPrompt,
		}),
		[],
	);

	// const [isHandling, setIsHandling] = useState(false); // TODO: This needs to be in the store
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [isSearchActive, setIsSearchActive] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [context, setContext] = useState<ChatMessage[]>([]);
	const [abortController, setAbortController] = useState<AbortController>(
		new AbortController(),
	);
	const { projectId } = useGetEditorRouter();
	const { saveMessageToDatabase } = useSaveMessageToDatabase();
	const [llmModel] = useLocalStorage({ key: AIModelLocalStorageKey });

	// TOKEN SIZE CALCULATION
	const getTokenSizeForContext = () => {
		// Model Token Size (Hard Limit)
		const modelTokenSize = 16000;
		// System Propmt Token Size
		const systemPropmtTokenSize = estimateTokens(systemPrompt.content);

		// Calculate the token size of current messages
		const currentTokenSize = messages.reduce((acc, message) => {
			return acc + estimateTokens(message.content);
		}, 0);

		// Buffer
		const buffer = 1000;

		// Token Size for Response
		const response = 4000;

		return (
			modelTokenSize -
			systemPropmtTokenSize -
			currentTokenSize -
			buffer -
			response
		);
	};

	// FETCHERS
	const fetchInitialMessages = async ({ pageParam = 0 }) => {
		const userId = user?.id;

		if (!userId) {
			return [];
		}

		const limit = 5;
		const offset = pageParam * limit;

		// Include the search text as a parameter

		const messages = await getChatMessagesByUserIdAndProjectId({
			userId,
			projectId,
			limit,
			offset,
			searchInputValue: debouncedSearchInput,
		});

		return messages.reverse();
	};

	const {
		data: initialMessages,
		error: initialMessagesError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
	} = useInfiniteQuery(
		['initialMessages', debouncedSearchInput, projectId], // adding searchInputValue as a dependency to the query key
		fetchInitialMessages,
		{
			getNextPageParam: (lastPage, pages) => {
				if (lastPage.length < 5) return false;
				return pages.length;
			},
			select: data => ({
				pages: [...data.pages].reverse(),
				pageParams: [...data.pageParams].reverse(),
			}),
		},
	);

	// HANDLERS
	const scrollDown = useCallback(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [scrollRef]);

	const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// If input is empty, return
		if (inputValue.length === 0) {
			toast.error('Please enter a message');
			return;
		}

		// If message is too long, return
		if (inputValue.length > 50000) {
			toast.error('Message is too long! Max 500 characters.');
			return;
		}

		const userMessage = inputValue;

		// Create Random ID for the messages

		const userMessageId = uuidv4();
		const assistantMessageId = uuidv4();

		// Put the user message into messages state

		const userMessageObj: ChatMessage = {
			id: userMessageId,
			user_id: user?.id,
			project_id: projectId,
			content: userMessage,
			metadata: {
				role: 'user',
				type: 'regular',
			},
		};

		const assistantMessageObj: ChatMessage = {
			id: assistantMessageId,
			user_id: user?.id,
			project_id: projectId,
			content: '',
			metadata: {
				role: 'assistant',
				type: 'regular',
			},
		};

		addNewMessages([userMessageObj, assistantMessageObj]);

		// Reset the input value
		setInputValue('');

		// Set Handling to true
		setIsHandling(true);

		// Retrieve relevant messages from the vector db
		const getContext = async () => {
			// Check the Context Type
			if (chatContext === 'project') {
				const similarMessages = await retrieveChatContext(
					userMessage,
					user?.id,
					projectId,
				);

				const context = messages
					.map(message => {
						return {
							role: message.metadata.role,
							content: message.content,
						};
					})
					.concat(
						similarMessages.map(message => {
							return {
								role: message.metadata.role,
								content: message.content,
							};
						}),
					)
					.concat([
						{
							role: 'user',
							content: languagePrompt + ' ' + userMessage,
						},
					]);

				// Return context
				return context;
			} else if (chatContext === 'references') {
				const context = messages.map(message => {
					return {
						...message,
						role: message.metadata.role,
						content: message.content,
					};
				});

				// Set Context
				setContext(context);

				// Return Context
				return context;
			} else if (chatContext === 'realtime') {
				// Get Realtime Context
				const realtimeContext = await fetch('/api/search-web', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						query: userMessage,
						userId: user?.id,
					}),
				}).then(res => res.json());

				const currentDate = new Date();
				const dateString = currentDate.toString();

				const context: any = [
					{
						role: 'user',
						content: `Web search results:\n\n ${JSON.stringify(
							realtimeContext,
						)}\nCurrent date:${dateString}\n\nInstructions:Using the provided web search results, write a comprehensive reply to the given query. Make sure to cite results using [[number](URL)] notation after the reference. If the provided search results refer to multiple subjects with the same name, write separate answers for each subject.\nQuery:${userMessage} `,
					},
				];

				// Set Context
				setContext(context);

				// Return Context
				return context;
			} else if (chatContext === 'file') {
				// Get File Context
				console.log('File Context');
			}
		};

		// Start Streaming
		if (chatContext != 'references') {
			try {
				const _context = await getContext();

				const response = await fetch('/api/new-chat', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						messages: [systemPrompt, ..._context],
						max_tokens: 3000,
						temperature,
						userId: user?.id,
						llmModel: llmModel || 'gpt-3.5-turbo',
					}),
					signal: abortController.signal,
				});

				if (!response.ok) {
					setIsHandling(false);
					if (response.statusText === 'OUT_OF_TOKEN') {
						toast.error(<ProPlanUpgradeToast target="AI" />, {
							style: reachedTokenLimitToastStyle,
						});
						deleteAILastMessage();
						return;
					} else {
						throw new Error(response.statusText);
					}
				}

				// This data is a ReadableStream
				const data = response.body;
				if (!data) {
					console.log('No data from response.', data);
					setIsHandling(false);

					throw new Error('No data from response.');
				}

				const reader = data.getReader();
				const decoder = new TextDecoder();
				let done = false;

				while (!done) {
					const { value, done: doneReading } = await reader.read();
					done = doneReading;
					const chunkValue = decoder.decode(value);
					addNewStreamingMessage(chunkValue, assistantMessageId);
					assistantMessageObj.content += chunkValue;

					/* Scroll to the bottom as we get chunk */
					scrollDown();
				}

				// Set Handling False
				setIsHandling(false);

				// Update token usage for free user
				if (!user?.is_subscribed)
					queryClient.invalidateQueries([QKFreeAIToken]);

				// Save the user message to the database
				await saveMessageToDatabase(userMessageObj);

				// After the user message has been saved, save the assistant message
				await saveMessageToDatabase(assistantMessageObj);
			} catch (error) {
				// If the error is due to aborting the request, return
				if (error instanceof DOMException && error.name === 'AbortError')
					return;
				console.log({ error });
				toast.error('Something went wrong. Please try again.');
				deleteAILastMessage();
				setIsHandling(false);
			}
		} else {
			//TODO: Refactor to use openai-stream
			try {
				const uploadId = activeFileReference?.fileId;

				const queryParams = new URLSearchParams({
					question: userMessage,
					projectId: projectId,
				});

				if (uploadId) {
					queryParams.append('uploadId', uploadId);
				}

				const singleDocumentEndpoint = '/api/single-file-chat';
				const generalLibraryChat = '/api/chat-library';

				const source = new SSE(
					`${
						queryParams.get('uploadId')
							? singleDocumentEndpoint
							: generalLibraryChat
					}?${queryParams.toString()}`,
					{
						payload: [messages],
					},
				);

				source.addEventListener('message', async function (e) {
					if (JSON.parse(e.data) === '[end]') {
						source.close();
						// Set Handling False
						setIsHandling(false);
					} else if (JSON.parse(e.data) === '[start]') {
						console.log('start');
					} else {
						const payload = JSON.parse(e.data);

						if (typeof payload === 'object') {
							const updatedMessage = await addNewFootnotes(
								payload,
								assistantMessageId,
							);

							// Update token usage for free user
							if (!user?.is_subscribed)
								queryClient.invalidateQueries([QKFreeAIToken]);

							// Save the user message to the database
							await saveMessageToDatabase(userMessageObj);

							// After the user message has been saved, save the assistant message
							await saveMessageToDatabase(updatedMessage);
						} else {
							await addNewStreamingMessage(payload, assistantMessageId);
							assistantMessageObj.content += payload;
						}

						/* Scroll to the bottom as we get chunk */
						scrollDown();
					}
				});

				source.stream();
			} catch (error) {
				console.log({ error });
				toast.error('Something went wrong. Please try again.');
				deleteAILastMessage();
				setIsHandling(false);
			}
		}
	};

	const regenerateHandler = useCallback(async () => {
		// Delete the last message from state
		const id = deleteUserLastMessageAndReturnID();

		// Delete the last message from database
		await fetch(`/api/delete-message`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id }),
		});

		// Set Handling to true
		setIsHandling(true);

		// Generate Random UUID for the new message
		const assistantMessageId = uuidv4();

		// Create a new message object
		const assistantMessageObj: ChatMessage = {
			id: assistantMessageId,
			user_id: user?.id,
			project_id: projectId,
			content: '',
			metadata: {
				role: 'assistant',
				type: 'regular',
			},
		};

		// Add the new message to the state
		addNewMessages([assistantMessageObj]);

		// Start Streaming
		try {
			const response = await fetch('/api/new-chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: [systemPrompt, ...context],
					max_tokens: 2000,
					temperature,
					userId: user?.id,
				}),
				signal: abortController.signal,
			});

			if (!response.ok) {
				setIsHandling(false);
				if (response.statusText === 'OUT_OF_TOKEN') {
					toast.error(<ProPlanUpgradeToast target="AI" />, {
						style: reachedTokenLimitToastStyle,
					});
					deleteAILastMessage();
					return;
				} else {
					throw new Error(response.statusText);
				}
			}

			// This data is a ReadableStream
			const data = response.body;
			if (!data) {
				console.log('No data from response.', data);
				setIsHandling(false);
				throw new Error('No data from response.');
			}

			const reader = data.getReader();
			const decoder = new TextDecoder();
			let done = false;

			while (!done) {
				const { value, done: doneReading } = await reader.read();
				done = doneReading;
				const chunkValue = decoder.decode(value);
				addNewStreamingMessage(chunkValue, assistantMessageId);
				assistantMessageObj.content += chunkValue;

				/* Scroll to the bottom as we get chunk */
				scrollDown();
			}

			// Update token usage for free user
			if (!user?.is_subscribed) queryClient.invalidateQueries([QKFreeAIToken]);

			// Set Handling False
			setIsHandling(false);

			// After the user message has been saved, save the assistant message
			await saveMessageToDatabase(assistantMessageObj);
		} catch (error) {
			// If the error is due to aborting the request, return
			if (error instanceof DOMException && error.name === 'AbortError') return;
			console.log({ error });
			setIsHandling(false);
			toast.error('Something went wrong. Please try again.');
			deleteAILastMessage();
		}
	}, [context, temperature, user?.id, projectId]);

	const cancelHandler = useCallback(() => {
		abortController.abort();
		setIsHandling(false);
		setAbortController(new AbortController());
	}, []);

	// EFFECTS
	// Initial Messages Effect
	useEffect(() => {
		if (initialMessages) {
			setInitialMessages(initialMessages.pages.flat() ?? []);
			setStatusMessage(isaacStatusMessages.allReady);
		}
	}, [initialMessages, setInitialMessages]);

	// Debounce search input
	useEffect(() => {
		const debouncer = debounce(
			() => setDebouncedSearchInput(searchInputValue),
			300,
		);

		debouncer();

		// Clean up function to cancel the debouncer if the component is unmounted
		return () => {
			debouncer.cancel();
		};
	}, [searchInputValue]);

	// Auto scroll as manipulation message is added, need a better way to manage this
	useEffect(() => {
		if (messages[messages.length - 1]?.metadata.type === 'manipulation') {
			scrollDown();
		}
	}, [messages, messages.length, scrollDown]);

	// EXPORTED VALUES
	const exposed: Exposed = {
		inputValue,
		searchInputValue,
		setInputValue,
		setSearchInputValue,
		messages,
		isLoading: status === 'loading',
		isSearchActive,
		// Last message is the AI message and has regular type
		isRegenerateSeen:
			messages &&
			[...messages]?.slice(-1)[0]?.metadata.type === 'regular' &&
			!isHandling &&
			[...messages]?.slice(-1)[0]?.metadata.role === 'assistant',
		isSearchOpen,
		setIsSearchOpen,
		isSearching,
		setIsSearching,
		isSettingsOpen,
		setIsSettingsOpen,
		submitHandler,
		regenerateHandler,
		cancelHandler,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
		initialMessagesError,
		scrollRef,
	};

	return exposed;
};

export default useChat;
