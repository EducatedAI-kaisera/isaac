/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const input = req.body.content;

	const apiKey = process.env.OPENAI_API_KEY;
	const apiURL = 'https://api.openai.com';

	const embeddingResponse = await fetch(apiURL + '/v1/embeddings', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			input,
			model: 'text-embedding-ada-002',
		}),
	});

	const embeddingData = await embeddingResponse.json();

	const [{ embedding }] = embeddingData.data;

	// Return the embedding to the client side
	res.status(200).json({ status: 'success', embedding: embedding });
}
