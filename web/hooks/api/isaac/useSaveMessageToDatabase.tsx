import { ChatMessage } from 'types/chat';

// Not really sure what purpose of having this as hook
const useSaveMessageToDatabase = () => {
	const saveMessageToDatabase = async (message: ChatMessage) => {
		// Save the message to the database
		await fetch('/api/saveMessage', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(message),
		});
	};

	return { saveMessageToDatabase };
};

export default useSaveMessageToDatabase;
