import fetch from 'node-fetch';

export async function performCompletion(res, body, inPlace = false) {
    const completion = await fetch('http://0.0.0.0:5001/api/completion', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'default-api-route-secret' },
    });
    if (body['stream']) {
        // Send an initial comment to establish the connection
        res.write(':ok\n\n');

        // Forward the data from the completion request to the client
				completion.body.on('data', chunk => {
					res.write(`data: ${Buffer.from(chunk.toString(), 'utf8').toString('base64')}\n\n`);
			});
        // Handle completion request completion
        completion.body.on('end', () => {
            // Close the SSE connection when the completion request is complete
            res.end();
        });
    }
    else {
        const response = await completion.text()
        if (inPlace) return response
        else res.end(response)
    }
}
