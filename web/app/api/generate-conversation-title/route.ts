import OpenAI from 'openai';

// Create an OpenAI API client (that's edge friendly!)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const encoder = new TextEncoder();
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

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
	const { messages } = (await req.json()) as {
		messages: any[];
	};

	// Ask OpenAI for a streaming chat completion given the prompt
	const response = await openai.completions.create({
		model: 'gpt-3.5-turbo-instruct',
		temperature: 0.6,
		prompt: `
			From the chat conversation below, generate a short title for it.
			Response must be just the title of words between 3 to 8 words.
			The title must be the same language as the language of the conversation.

			conversation:
			${messages.map(i => `${i.role}: ${i.content}.`).join('\n')}
			`,
		stream: true,
	});

	const { stream, controller } = createCustomReadableStream();

	for await (const chunk of response) {
		// Forward the data from the completion request to the client
		if (
			controller &&
			chunk.choices[0]?.text &&
			chunk.choices[0].text.trim() !== ''
		) {
			controller.enqueue(
				encoder.encode(
					`data: ${Buffer.from(chunk.choices[0].text).toString('base64')}\n\n`,
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
