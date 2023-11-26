import { isaacStatusMessages } from 'data/isaac';
import {
	ChatContext,
	ChatMessage,
	FootNote,
	LiteratureSource,
} from 'types/chat';
import { create } from 'zustand';

type ChatStore = {
	messages: ChatMessage[];
	setInitialMessages: (messages: ChatMessage[]) => void;
	addNewMessages: (messages: ChatMessage[]) => void;
	addNewStreamingMessage: (chunk: string, id: string) => void;
	updateSourcesMessage: (source: LiteratureSource[], id: string) => ChatMessage;
	addNewFootnotes: (sources: any, id: string) => ChatMessage;
	deleteEditorMessage: (id: string) => void;
	deleteAILastMessage: () => void;
	deleteUserLastMessageAndReturnID: () => void;
	chatContext: ChatContext;
	setChatContext: (context: ChatContext) => void;
	temperature: number;
	setTemperature: (temperature: number) => void;
	activeFileReference: { name: string; fileId: string };
	setActiveFileReference: (ref?: { name: string; fileId: string }) => void;
	statusMessage: string;
	setStatusMessage: (text: string) => void;
	isHandling: boolean;
	setIsHandling: (bool: boolean) => void;
};

const useChatStore = create<ChatStore>((set, get) => ({
	messages: [],
	setInitialMessages: (messages: ChatMessage[]) => set({ messages }),
	addNewMessages: (messages: ChatMessage[]) =>
		set(state => ({
			messages: [...state.messages, ...messages],
		})),
	addNewStreamingMessage: (chunk: string, id: string) => {
		const messageToChange = get().messages.find(message => message.id === id);
		if (messageToChange) {
			set(state => ({
				messages: [
					...state.messages.filter(message => message.id !== id),
					{
						...messageToChange,
						content: messageToChange.content + chunk,
					},
				],
			}));
		}
	},
	updateSourcesMessage: (sources, id) => {
		let updatedMessage: ChatMessage;
		const messageToChange = get().messages.find(message => message.id === id);
		if (sources?.length && messageToChange) {
			updatedMessage = {
				...messageToChange,
				content: 'source found',
				metadata: {
					manipulation_title: 'Here are some sources for this passage:',
					role: 'assistant',
					type: 'sources',
					sources,
				},
			};
		} else {
			updatedMessage = {
				...messageToChange,
				content: 'source not found',
				metadata: {
					manipulation_title: 'Source not found',
					role: 'assistant',
					type: 'sources',
					sources,
				},
			};
		}
		set(state => ({
			messages: [
				...state.messages.filter(message => message.id !== id),
				updatedMessage,
			],
		}));

		return updatedMessage;
	},
	addNewFootnotes: (sources, id) => {
		const messageToChange = get().messages.find(message => message.id === id);

		const footnotes: FootNote[] = sources.sources.map(source => ({
			id: source.metadata.uploadID,
			title:
				source.metadata.citation?.name ??
				source.metadata.file_name ??
				'No title',
			page: source.metadata.loc?.pageNumber,
		}));

		const updatedMessage: ChatMessage = {
			...messageToChange,
			metadata: {
				role: 'assistant',
				type: 'regular',
				footnotes: footnotes,
			},
		};

		set(state => ({
			messages: [
				...state.messages.filter(message => message.id !== id),
				updatedMessage,
			],
		}));

		return updatedMessage;
	},
	// Use this to delete a message from the editor (In regenerate handler)
	deleteEditorMessage: (id: string) => {
		set(state => ({
			messages: state.messages.filter(message => message.id !== id),
		}));
	},
	// Put the editor message into it's original index (In regenerate handler)
	addEditorMessageIntoIndex: (message: ChatMessage, index: number) => {
		set(state => ({
			messages: [
				...state.messages.slice(0, index),
				message,
				...state.messages.slice(index),
			],
		}));
	},
	// Use for regenerate calls
	deleteUserLastMessageAndReturnID: () => {
		const lastMessage = get().messages.slice(-1)[0];
		// Check the last message is from the assistant
		if (!lastMessage || lastMessage.metadata.role !== 'assistant') return;
		set(state => ({
			messages: state.messages.slice(0, state.messages.length - 1),
		}));

		// Return the id of the deleted message to be able to delete it from the server
		return lastMessage.id;
	},

	deleteAILastMessage: () => {
		const lastMessage = get().messages.slice(-1)[0];
		// Check the last message is from the assistant
		if (
			lastMessage.metadata.role === 'assistant' &&
			lastMessage.content === ''
		) {
			set(state => ({
				messages: state.messages.slice(0, state.messages.length - 1),
			}));
		}
	},

	chatContext: 'project',
	setChatContext: context => {
		const { activeFileReference } = get();
		set({
			chatContext: context,
			statusMessage:
				context === 'references'
					? isaacStatusMessages.chatWithAllFile
					: isaacStatusMessages.allReady,
			activeFileReference:
				context !== 'references' ? undefined : activeFileReference,
		});
	},
	temperature: 0.78,
	setTemperature: temperature => set({ temperature }),
	activeFileReference: undefined,
	setActiveFileReference: fileReference => {
		const { chatContext, statusMessage } = get();
		set({
			activeFileReference: fileReference,
			statusMessage:
				chatContext === 'references' && fileReference
					? `${isaacStatusMessages.chatSingleFile}`
					: isaacStatusMessages.chatWithAllFile,
		});
	},
	statusMessage: isaacStatusMessages.initializing,
	setStatusMessage: (message: string) => set({ statusMessage: message }),
	isHandling: false,
	setIsHandling: isHandling => set({ isHandling }),
}));

export default useChatStore;
