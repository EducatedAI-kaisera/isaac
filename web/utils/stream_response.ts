import fetch from 'node-fetch';

export const config = {
	runtime: "edge",
};

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
		// Send an initial comment to establish the connection
		res.write(':ok\n\n');

		// Forward the data from the completion request to the client
		completion.body.on('data', chunk => {
			const encoder = new TextEncoder();
			const encodedData = encoder.encode(
				`data: ${chunk.toString('base64')}\n\n`,
			);
			res.write(encodedData);
		});
		// Handle completion request completion
		completion.body.on('end', () => {
			// Send a final chunk to the frontend that says [DONE]
			const encoder = new TextEncoder();
			const encodedDoneMessage = encoder.encode(
				`data: ${Buffer.from('[DONE]').toString('base64')}\n\n`,
			);
			res.write(encodedDoneMessage);
			// Close the SSE connection when the completion request is complete
			res.end();
		});
	} else {
		const response = await completion.text();
		if (inPlace) return response;
		else res.end(response);
	}
}
