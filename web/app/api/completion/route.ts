import fetch from 'node-fetch';

const encoder = new TextEncoder();

// Function to create and return a custom readable stream
function createCustomReadableStream() {
	let controller;
	// Create a stream
	const customReadable = new ReadableStream({
		start(_controller) {
			controller = _controller;
			// Initial data, if any
			controller.enqueue(encoder.encode("data: ok\n\n"));
		},
	});
	return { stream: customReadable, controller };
}

// Can be 'nodejs', but Vercel recommends using 'edge'
export const runtime = 'nodejs'

// Prevents this route's response from being cached
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
	const getBody = await req.json()
	const { stream, controller } = createCustomReadableStream();
	// if word count is less than 5, return error
	if (getBody.split(' ').length < 5) {
		if (controller) {
			controller.enqueue(encoder.encode(`data: Please write a few words and try again. Kindly - Isaac 🧑‍🚀\n\n`));
		}
		// Close the SSE connection when the completion request is complete
		if (controller) {
			controller.close();
		}
		// Return the stream and try to keep the connection alive
		return new Response(stream, {
			// Set headers for Server-Sent Events (SSE) / stream from the server
			headers: { 'Content-Type': 'text/event-stream; charset=utf-8', Connection: 'keep-alive', 'Cache-Control': 'no-cache, no-transform', 'Content-Encoding': 'none' },
		})
	}
	const completion = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/api/completion`,
		{
			method: 'POST',
			body: JSON.stringify({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content:
							'You are a prolific academic research writing assistant. Your main job is to continue text input by users with one or maximum two perfectly fitting and insightful sentences. You always listen to additional requests from the user.',
					},

					{
						role: 'user',
						content: getBody,
					},
				],
				temperature: 0.3,
				max_tokens: 2000,
				top_p: 1,
				stream: true,
			}),
			headers: {
				'Content-Type': 'application/json',
				'X-API-KEY': process.env.NEXT_PUBLIC_API_ROUTE_SECRET,
			},
		},
	);
	// Forward the data from the completion request to the client
	completion.body.on('data', chunk => {
		if (controller) {
			controller.enqueue(encoder.encode(`data: ${chunk.toString('base64')}\n\n`));
		}
	});
	// Handle completion request completion
	completion.body.on('end', () => {
		// Send a final chunk to the frontend that says [DONE]
		if (controller) {
			controller.enqueue(encoder.encode(`data: ${Buffer.from('[DONE]').toString('base64')}\n\n`));
		}
		// Close the SSE connection when the completion request is complete
		if (controller) {
			controller.close();
		}
	});
	// Return the stream and try to keep the connection alive
	return new Response(stream, {
		// Set headers for Server-Sent Events (SSE) / stream from the server
		headers: { 'Content-Type': 'text/event-stream; charset=utf-8', Connection: 'keep-alive', 'Cache-Control': 'no-cache, no-transform', 'Content-Encoding': 'none' },
	})
	function generatePrompt(input) {
		return ` The text is:
  ${input}
  `;
	}
}
