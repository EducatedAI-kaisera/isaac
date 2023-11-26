/* eslint-disable @typescript-eslint/no-unused-vars */
import Chatbox from '@components/chat/Chatbox';
import ChatInput from '@components/chat/ChatInput';
import ChatInputSetting from '@components/chat/ChatInputSetting';
import { useUser } from '@context/user';
import useChat from '@hooks/useChat';
import clsx from 'clsx';
import React, { useCallback } from 'react';

const Chat = () => {
	const { user } = useUser();
	const {
		inputValue,
		isLoading,
		isSearchOpen,
		isSearching,
		isSearchActive,
		isSettingsOpen,
		isFetchingNextPage,
		isRegenerateSeen,
		setIsSearchOpen,
		setIsSettingsOpen,
		setInputValue,
		messages,
		submitHandler,
		fetchNextPage,
		hasNextPage,
		searchInputValue,
		setSearchInputValue,
		cancelHandler,
		regenerateHandler,
		scrollRef,
	} = useChat();

	const clearSearchHandler = useCallback(() => {
		setSearchInputValue('');
		setIsSearchOpen(false);
	}, []);

	return (
		<div
			className="w-full h-full flex flex-col bg-white dark:bg-black"
			id="chat"
		>
			{/* Chatbox */}
			<Chatbox
				messages={messages}
				clearSearchHandler={clearSearchHandler}
				email={user?.email}
				avatarUrl={user?.user_metadata?.avatar_url ?? ''}
				isLoading={isLoading}
				isSearchActive={isSearchActive}
				isSearchOpen={isSearchOpen}
				fetchNextPage={fetchNextPage}
				isFetchingNextPage={isFetchingNextPage}
				hasNextPage={hasNextPage}
				scrollRef={scrollRef}
			/>

			{/* Input Container */}
			<ChatInput
				inputValue={inputValue}
				setInputValue={setInputValue}
				submitHandler={submitHandler}
				ChatInputSettings={
					<ChatInputSetting
						searchInputValue={searchInputValue}
						setSearchInputValue={setSearchInputValue}
						isLoading={isLoading}
						isSearchOpen={isSearchOpen}
						isSearching={isSearching}
						isSettingsOpen={isSettingsOpen}
						setIsSearchOpen={setIsSearchOpen}
						setIsSettingsOpen={setIsSettingsOpen}
						cancelHandler={cancelHandler}
						regenerateHandler={regenerateHandler}
						isRegenerateSeen={isRegenerateSeen}
					/>
				}
			/>
		</div>
	);
};

export default React.memo(Chat);
