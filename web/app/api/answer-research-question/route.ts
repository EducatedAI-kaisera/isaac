import { updateTokenUsageForFreeTier } from '@resources/updateTokenUsageForFreeTier';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';


// Create an OpenAI API client (that's edge friendly!)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
	const { prompt, userId, editorLanguage } = await req.json();

	const messages: ChatCompletionMessageParam[] = [
		{
			role: 'system',
			content: `You are a research assistant that conducts academic literature reviews. You always respond in ${editorLanguage} If asked a research question, you will give a detailed, nuanced and precise answer. You will provide in-text citations in APA format. Your output should have the following structure: 1. Answer the research question 2. Add two line breaks 3. Write References. 4. Add two line breaks. 5. List the references you used to answer the research question. You list the references in APA format, including URLs if available. You list the references in alphabetical order by the last name of the first author.
	If you are not asked a research question, you respond with "Please ask a research question. Kindly - Isaac 🧑‍🚀". The most important thing is that you never invent sources.`,
		},

		{ role: 'user', content: prompt },
	];

	await updateTokenUsageForFreeTier(userId);

	// Ask OpenAI for a streaming chat completion given the prompt
	const response = await openai.chat.completions.create({
		model: 'gpt-4-1106-preview',
		stream: true,
		messages: messages,
		temperature: 0.3,
		max_tokens: 812,
	});

	// Convert the response into a friendly text-stream
	const stream = OpenAIStream(response);

	// Respond with the stream
	return new StreamingTextResponse(stream);
}
