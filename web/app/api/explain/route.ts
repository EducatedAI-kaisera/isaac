// import { updateTokenUsageForFreeTier } from '@resources/updateTokenUsageForFreeTier';
// import { AIModels } from 'data/aiModels.data';
// import { performCompletion } from '../../utils/stream_response'

// // eslint-disable-next-line import/no-anonymous-default-export
// export default async function (req, res) {
// 	res.setHeader('Content-Type', 'text/event-stream');
// 	res.setHeader('Cache-Control', 'no-cache');
// 	res.setHeader('Connection', 'keep-alive');
// 	res.setHeader('Content-Encoding', 'none');

// 	const userId = req.query.userId;
// 	let llmModel = req.query.llmModel;
// 	const user = await updateTokenUsageForFreeTier(userId);

// 	if (!user.is_subscribed) {
// 		llmModel = AIModels.GPT_3_5;
// 	}

// 	await performCompletion(res, {
// 		model: llmModel || 'gpt-3.5-turbo',
// 		messages: [{ role: 'user', content: req.body }],
// 		temperature: 0.4,
// 		max_tokens: 3500,
// 		top_p: 1,
// 		frequency_penalty: 0,
// 		presence_penalty: 0,
// 		stream: true,
// 	})
// }


import { updateTokenUsageForFreeTier } from '@resources/updateTokenUsageForFreeTier';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';


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

