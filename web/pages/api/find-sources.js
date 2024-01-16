/* eslint-disable import/no-anonymous-default-export */
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
	console.time('Function Execution Time');

	try {
		const completion = await openai.createChatCompletion({
			model: 'gpt-4',
			messages: [
				{
					role: 'system',
					content:
						'You are a helpful assistant that extracts the most relevant keywords from any statement. You always add a + between every word of your output (eg. income+gpd+growth). You can under no circumstance output more than 5 words. If a keyword has several words you still need to add a + between every word. You return the keywords in the input language and in English. If the input language is in English, you just return in English. The structure should be as follows: First you write the keywords in the input language like so: keyword+keyword+keyword+keyword+keyword then you write "BREAK" and then you write the English keywords like so: keyword+keyword+keyword+keyword+keyword".',
				},
				{
					role: 'user',
					content:
						'Extract keywords from the following text to find academic sources using semantic scholar:' +
						req.body.input,
				},
			],
			temperature: 0.0,
			max_tokens: 3500,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		});

		const search_query = completion.data.choices[0].message.content;
		const search_query_parts = search_query.split('BREAK');
		const search_query_input_language = search_query_parts[0];
		const search_query_english = search_query_parts[1];

		// Fetch and process data
		const processData = async query => {
			const response = await fetch(
				`http://api.semanticscholar.org/graph/v1/paper/search?query=${query}&limit=100&fields=title,url,abstract,authors,citationStyles,journal,citationCount,year,externalIds`,
				{
					method: 'GET',
					headers: {
						'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY,
					},
				},
			);

			const data = await response.json();
			if (!data.data || data.data.length === 0) return null;
			return data.data;
		};

		let searchData = await processData(search_query_input_language);
		if (!searchData) searchData = await processData(search_query_english);

		if (!searchData) {
			res.status(404).json({ message: 'No literature found' });
		} else {
			const processResults = results => {
				const rankedResults = results.sort(
					(a, b) => b.citationCount - a.citationCount,
				);
				const limitedRankedResults = rankedResults.slice(0, 20);
				const abstracts = limitedRankedResults.map(paper =>
					paper.abstract ? paper.abstract : ' ',
				);
				const ids = limitedRankedResults.map(paper => ({ id: paper.paperId }));

				return { abstracts, ids, limitedRankedResults };
			};

			const { abstracts, ids, limitedRankedResults } =
				processResults(searchData);

			const vectorStore = await MemoryVectorStore.fromTexts(
				abstracts,
				ids,
				new OpenAIEmbeddings(),
			);

			const vectorSearch = await vectorStore.similaritySearch(
				req.body.input,
				5,
			);
			const limitedResults = limitedRankedResults.filter(paper =>
				vectorSearch.some(paperId => paperId.metadata.id === paper.paperId),
			);

			res.status(200).json({ literature: limitedResults });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
	console.timeEnd('Function Execution Time');
}
