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

export async function performCompletion(res, body, inPlace = false) {
	const completion = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/api/completion`,
		{
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				'X-API-KEY': process.env.NEXT_PUBLIC_API_ROUTE_SECRET,
			},
		},
	);
	if (body['stream']) {
		if (res) {
			// Send an initial comment to establish the connection
			res.write(':ok\n\n');
			// Forward the data from the completion request to the client
			completion.body.on('data', chunk => {
				const encodedData = encoder.encode(
					`data: ${chunk.toString('base64')}\n\n`,
				);
				res.write(encodedData);
			});
			// Handle completion request completion
			completion.body.on('end', () => {
				// Send a final chunk to the frontend that says [DONE]
				const encodedDoneMessage = encoder.encode(
					`data: ${Buffer.from('[DONE]').toString('base64')}\n\n`,
				);
				res.write(encodedDoneMessage);
				// Close the SSE connection when the completion request is complete
				res.end();
			});
		}
		else {
			const { stream, controller } = createCustomReadableStream();
			// Enqueue additional data later
			function enqueueData(message) {
				if (controller) {
					controller.enqueue(encoder.encode(`data: ${message}\n\n`));
				}
			}
			// Function to close the stream
			function closeStream() {
				if (controller) {
					controller.close();
				}
			}
			// Forward the data from the completion request to the client
			completion.body.on('data', chunk => {
				enqueueData(chunk.toString('base64'))
			});
			// Handle completion request completion
			completion.body.on('end', () => {
				// Send a final chunk to the frontend that says [DONE]
				enqueueData(Buffer.from('[DONE]').toString('base64'))
				// Close the SSE connection when the completion request is complete
				closeStream();
			});
			// Return the stream and try to keep the connection alive
			return new Response(stream, {
				// Set headers for Server-Sent Events (SSE) / stream from the server
				headers: { 'Content-Type': 'text/event-stream; charset=utf-8', Connection: 'keep-alive', 'Cache-Control': 'no-cache, no-transform', 'Content-Encoding': 'none' },
			})
		}
	} else {
		const response = await completion.text();
		if (inPlace) return response;
		else res.end(response);
	}
}
