import Message from '@components/chat/Message';
import Spinner from '@components/core/Spinner';
import { Button } from '@components/ui/button';
import useAddReference from '@hooks/api/useAddToReference';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import useCreateNote from '@resources/notes';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { ChatMessage } from 'types/chat';
// Types
interface ChatboxProps {
	isLoading: boolean;
	isSearchOpen: boolean;
	isSearchActive: boolean;
	messages: ChatMessage[];
	email: string;
	avatarUrl: string;
	fetchNextPage: () => void;
	clearSearchHandler: () => void;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	scrollRef: React.RefObject<HTMLDivElement>;
}

const Chatbox = ({
	isLoading,
	isSearchActive,
	isSearchOpen,
	messages,
	email,
	avatarUrl,
	fetchNextPage,
	isFetchingNextPage,
	hasNextPage,
	clearSearchHandler,
	scrollRef,
}: ChatboxProps) => {
	const { projectId } = useGetEditorRouter();
	const { mutateAsync: addToReference } = useAddReference();
	const { mutateAsync: createNote } = useCreateNote();

	// Message object for empty chat state
	const emptyMessage: ChatMessage = {
		id: '0', // You can set this to any suitable value
		user_id: 'system', // System user, or any suitable identifier
		project_id: '0', // Default or specific project ID
		content: 'Hi there, my name is Isaac. How can I help you?', // Content of the message
		metadata: {
			role: 'assistant', // Role, you can define it according to your needs
			type: 'regular', // Type of the message
		},
	};

	return (
		<motion.div
			layout="position"
			ref={scrollRef}
			className="z-0 w-full h-full pr-2 pl-4 pt-2 overflow-y-scroll pb-6"
		>
			{/* Fetch Next Page Button */}
			{!isLoading && !isFetchingNextPage && hasNextPage && !isSearchActive && (
				<div className="flex items-center justify-center w-full py-4">
					<Button onClick={() => fetchNextPage()} size="sm" variant="outline">
						Load More
					</Button>
				</div>
			)}
			{/* Search Empty State */}
			{!isLoading && isSearchActive && messages.length === 0 && (
				<div>
					<span className="text-sm text-neutral-500">
						There is no result for this search query.
					</span>
					<button
						onClick={() => {
							clearSearchHandler();
						}}
						className="ml-1 text-sm underline transition-colors duration-100 ease-in-out underline-offset-4 hover:text-neutral-600 dark:hover:text-neutral-200"
					>
						Clear Search
					</button>
				</div>
			)}
			<div className="space-y-12">
				{!isLoading ? (
					messages?.length > 0 ? (
						messages.map(message => (
							<Message
								key={message.id}
								message={message}
								email={email}
								avatarUrl={avatarUrl ?? ''}
								saveToNote={text => createNote(text)}
								saveToReferencesHandler={({ url, ...data }) => {
									addToReference({
										projectId,
										papers: [data],
									});
								}}
							/>
						))
					) : (
						<Message
							key={emptyMessage.id}
							message={emptyMessage}
							email={''}
							avatarUrl={avatarUrl ?? ''}
							saveToNote={text => createNote(text)}
							saveToReferencesHandler={({ url, ...data }) => {
								addToReference({
									projectId,
									papers: [data],
								});
							}}
						/>
					)
				) : (
					<div className="flex items-center justify-center w-full h-full py-8">
						<Spinner size="md" className="animate-fade-in" />
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default memo(Chatbox);
