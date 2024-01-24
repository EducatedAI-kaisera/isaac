import { updateTokenUsageForFreeTier } from '@resources/updateTokenUsageForFreeTier';
import { AIModels } from 'data/aiModels.data';
import { type NextRequest } from 'next/server';
import fetch from 'node-fetch';

const encoder = new TextEncoder();

// Function to create and return a custom readable stream
function createCustomReadableStream() {
	let controller;
	// Create a stream
	const customReadable = new ReadableStream({
		start(_controller) {
			controller = _controller;
		},
	});
	return { stream: customReadable, controller };
}

// Can be 'nodejs', but Vercel recommends using 'edge'
export const runtime = 'nodejs';

// Prevents this route's response from being cached
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
	const getBody = await req.json()

	const searchParams = req.nextUrl.searchParams;

	const userId = searchParams.get('userId');

	const editorLanguage = searchParams.get('editorLanguage');


	await updateTokenUsageForFreeTier(userId);

	const completion = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/api/completion`,
		{
			method: 'POST',
			body: JSON.stringify({
				model: 'gpt-4-1106-preview',
				messages: [
					{
						role: 'system',
						content: `You are a research assistant that conducts academic literature reviews. You always respond in ${editorLanguage} If asked a research question, you will give a detailed, nuanced and precise answer. You will provide in-text citations in APA format. Your output should have the following structure: 1. Answer the research question 2. Add two line breaks 3. Write References. 4. Add two line breaks. 5. List the references you used to answer the research question. You list the references in APA format, including URLs if available. You list the references in alphabetical order by the last name of the first author.
				If you are not asked a research question, you respond with "Please ask a research question. Kindly - Isaac 🧑‍🚀". The most important thing is that you never invent sources.`,
					},

					{ role: 'user', content: getBody },
				],
				temperature: 0.3,
				max_tokens: 812,
				top_p: 1,
				stream: true,
			}),
			headers: {
				'Content-Type': 'application/json',
				'X-API-KEY': process.env.NEXT_PUBLIC_API_ROUTE_SECRET,
			},
		},
	);

	const { stream, controller } = createCustomReadableStream();
	// Forward the data from the completion request to the client
	completion.body.on('data', chunk => {
		if (controller) {
			controller.enqueue(
				encoder.encode(`data: ${chunk.toString('base64')}\n\n`),
			);
		}
	});
	// Handle completion request completion
	completion.body.on('end', () => {
		// Send a final chunk to the frontend that says [DONE]
		if (controller) {
			controller.enqueue(
				encoder.encode(`data: ${Buffer.from('[DONE]').toString('base64')}\n\n`),
			);
		}
		// Close the SSE connection when the completion request is complete
		if (controller) {
			controller.close();
		}
	});
	// Return the stream and try to keep the connection alive
	return new Response(stream, {
		// Set headers for Server-Sent Events (SSE) / stream from the server
		headers: {
			'Content-Type': 'text/event-stream; charset=utf-8',
			Connection: 'keep-alive',
			'Cache-Control': 'no-cache, no-transform',
			'Content-Encoding': 'none',
		},
	});
}

