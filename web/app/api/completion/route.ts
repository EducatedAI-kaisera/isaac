import OpenAI from 'openai';

const encoder = new TextEncoder();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export const runtime = 'edge';

export async function POST(req: Request) {
	const getBody = await req.json();
	const { stream, controller } = createCustomReadableStream();
	// if word count is less than 5, return error
	if (getBody.split(' ').length < 5) {
		if (controller) {
			controller.enqueue(
				encoder.encode(
					`data: Please write a few words and try again. Kindly - Isaac 🧑‍🚀\n\n`,
				),
			);
		}
		// Close the SSE connection when the completion request is complete
		if (controller) {
			controller.close();
		}
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

	const completion = await openai.chat.completions.create({
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
	});
	// Forward the data from the completion request to the client

	for await (const chunk of completion) {
		// Forward the data from the completion request to the client
		if (
			controller &&
			chunk.choices[0]?.delta?.content &&
			chunk.choices[0].delta.content.trim() !== ''
		) {
			controller.enqueue(
				encoder.encode(
					`data: ${Buffer.from(chunk.choices[0].delta.content).toString(
						'base64',
					)}\n\n`,
				),
			);
		}
	}

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
