import { updateTokenUsageForFreeTier } from '@resources/user';
import { OpenAIStream } from '@utils/openai-stream';
import { NextRequest } from 'next/server';

export const config = {
	runtime: 'edge',
};

export default async function handler(req: NextRequest, res) {
	const { messages, temperature, max_tokens, userId, llmModel } =
		await req.json();
	let user;
	try {
		user = await updateTokenUsageForFreeTier(userId);
	} catch (error) {
		return new Response(error.message, {
			status: 400,
			statusText: error.message,
		});
	}

	const stream = await OpenAIStream({
		model: user?.is_subscribed ? llmModel : 'gpt-3.5-turbo-16k',
		messages,
		temperature,
		max_tokens,
	});

	// Return the stream in the response
	return new Response(stream, {
		headers: {
			Connection: 'keep-alive',
			'Cache-Control': 'no-cache, no-transform',
			'Content-Type': 'text/event-stream',
		},
	});
}
