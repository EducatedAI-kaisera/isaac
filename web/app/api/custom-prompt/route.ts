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

	let llmModel = searchParams.get('llmModel');

	const user = await updateTokenUsageForFreeTier(userId);

	if (!user.is_subscribed) {
		llmModel = AIModels.GPT_3_5;
	}

	const completion = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/api/completion`,
		{
			method: 'POST',
			body: JSON.stringify({
				model: llmModel || 'gpt-3.5-turbo',
				messages: [
					{ role: 'system', content: searchParams.get('systemPrompt') },
					{ role: 'user', content: getBody },
				],
				temperature: 0.3,
				max_tokens: 3000,
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
