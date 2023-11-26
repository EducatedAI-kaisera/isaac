import Spinner from '@components/core/Spinner';
import { TextareaChat } from '@components/ui/textarea-chat';
import useChatStore from '@context/chat.store';
import { Send } from 'lucide-react';
import React, { ChangeEvent, ReactNode, useCallback, useRef } from 'react';

// Types
interface ChatInputProps {
	inputValue: string;
	setInputValue: React.Dispatch<React.SetStateAction<string>>;
	submitHandler: (e: React.FormEvent<HTMLFormElement>) => void;
	ChatInputSettings?: ReactNode;
}

const ChatInput = ({
	inputValue,
	setInputValue,
	submitHandler,
	ChatInputSettings,
}: ChatInputProps) => {
	// const chatContext = useChatStore(s => s.chatContext);
	const isHandling = useChatStore(s => s.isHandling);
	// const temperature = useChatStore(s => s.temperature);
	// const setTemperature = useChatStore(s => s.setTemperature);
	const formRef = useRef<HTMLFormElement>(null);

	// Submit Form on Enter
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				formRef.current?.dispatchEvent(
					new Event('submit', { cancelable: true, bubbles: true }),
				);
			}
		},
		[],
	);

	const onChange = useCallback((e: ChangeEvent) => {
		setInputValue((e.target as HTMLInputElement).value);
	}, []);

	return (
		<div className="p-4 bg-gradient-to-b from-transparent dark:via-neutral-950/60 dark:to-neutral-900 via-bg-desertStorm-100/60 to-desertStorm-100">
			{/* Container */}
			<div className="w-full max-w-5xl mx-auto">
				{/* Buttons */}
				{ChatInputSettings}
				{/* Input Container */}
				<form
					ref={formRef}
					onSubmit={submitHandler}
					className="flex items-center w-full bg-white rounded-md border focus-within:ring-ring focus-within:ring-[2px] dark:bg-neutral-950"
				>
					<TextareaChat
						id="isaac-chat-input"
						className="min-h-10 peer placeholder:pt-1"
						placeholder="Type your message..."
						value={inputValue}
						onChange={onChange}
						onKeyDown={handleKeyDown}
					/>
					<button className="pr-4" type="submit">
						{!isHandling ? (
							<Send
								size="18"
								className="text-neutral-600 dark:peer-focus:text-neutral-500 peer-focus:text-neutral-300"
							/>
						) : (
							<Spinner />
						)}
					</button>
				</form>
			</div>
		</div>
	);
};

export default ChatInput;
