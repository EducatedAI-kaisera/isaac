import { getDbInstance } from '@utils/pgClient';
import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function toSql(value) {
	if (!Array.isArray(value)) {
		throw new Error('expected array');
	}
	return JSON.stringify(value);
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	try {
		const input = {
			input: req.body.query,
			model: 'text-embedding-ada-002',
		};

		const db = getDbInstance(); // Initialize the database connection

		const userId = req.body.user_id;

		const completion = await openai.createEmbedding(input);

		const embedding = completion.data.data[0].embedding;

		const documents = await db.query(
			`
      SELECT *
      FROM chat_messages
      WHERE user_id = $1
      AND to_tsvector('english', content) @@ plainto_tsquery('english', $2)  -- Full text search
      ORDER BY embedding <-> vector($3)  -- Semantic search
      LIMIT 5
      `,
			[userId, req.body.query, toSql(embedding)],
		);

		res.json(documents);
	} catch (error) {
		console.error(error);
		res.status(500).send('Server Error');
	}
}
