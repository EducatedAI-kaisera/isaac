import fetch from 'node-fetch';

export async function performCompletion(res, body) {
    // Send an initial comment to establish the connection
    res.write(':ok\n\n');
    const completion = await fetch('http://0.0.0.0:5001/api/completion', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'default-api-route-secret' },
    });
    if (body['stream']) {
        // Forward the data from the completion request to the client
        completion.body.on('data', chunk => {
            // Send each chunk as an SSE message
            res.write(`data: ${chunk}\n\n`);
        });
        // Handle completion request completion
        completion.body.on('end', () => {
            // Close the SSE connection when the completion request is complete
            res.end();
        });
    }
    else {
        const response = await completion.text()
        res.end(response)
    }
}
