import { updateTokenUsageForFreeTier } from '@resources/updateTokenUsageForFreeTier';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';


// Create an OpenAI API client (that's edge friendly!)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
	const { prompt, userId, llmModel } = await req.json();

	await updateTokenUsageForFreeTier(userId);

	// Ask OpenAI for a streaming chat completion given the prompt
	const response = await openai.chat.completions.create({
		model: llmModel,
		stream: true,
		messages: [{ role: 'user', content: prompt }],
		temperature: 0.3,
		max_tokens: 812,
	});

	// Convert the response into a friendly text-stream
	const stream = OpenAIStream(response);

	// Respond with the stream
	return new StreamingTextResponse(stream);
}

