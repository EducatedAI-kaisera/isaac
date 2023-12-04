import fetch from 'node-fetch';

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req, res) {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('Content-Encoding', 'none');

	// if word count is less than 5, return error
	if (req.body.split(' ').length < 5) {
		res.write('data: "Please write a few words and try again. Kindly - Isaac 🧑‍🚀"\n\n');
		return res.end();
	}

	// Send an initial comment to establish the connection
	res.write(':ok\n\n');

	const completion = await fetch('http://0.0.0.0:5001/api/completion', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'x-api-key': 'default-api-route-secret' },
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
					content: req.body,
				},
			],
			temperature: 0.3,
			max_tokens: 2000,
			top_p: 1,
			stream: true,
		}),
	});

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

	function generatePrompt(input) {
		return ` The text is:
  ${input}
  `;
	}
}
