import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PostgresVectorStore } from '../../embeddings/vector-stores/postgres';

export default async function handler(req, res) {
	const vectorStore = await PostgresVectorStore.fromExistingIndex(
		new OpenAIEmbeddings(),
		{
			tableName: 'chat_messages',
			queryName: 'match_chat_messages',
		},
	);

	const query = req.body.query;
	const user_id = req.body.user_id;
	const project_id = req.body.project_id;
	const result = await vectorStore.similaritySearchVectorWithScore(
		query,
		3,
		user_id,
	);

	res.json(result);
}
