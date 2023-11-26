import { SupabaseClient } from '@supabase/supabase-js';
import { getDbInstance } from '@utils/pgClient';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { BaseRetriever } from 'langchain/schema/retriever';

const embeddings = new OpenAIEmbeddings({
	openAIApiKey: process.env.OPENAI_API_KEY,
});

const uniqBy = <T>(arr: T[], predicate: (item: T) => unknown): T[] => {
	if (!Array.isArray(arr)) {
		return [];
	}

	const pickedObjects = arr
		.filter(item => item)
		.reduce((map, item) => {
			const key = predicate(item);

			if (!key) {
				return map;
			}

			return map.has(key) ? map : map.set(key, item);
		}, new Map())
		.values();

	return [...pickedObjects];
};

/**
 * Adds an index within square brackets and a colon to the beginning of a content string in the format '[${index}]: ${content}'.
 *
 * @param index The index to add.
 * @param content The content string to which the index will be added.
 * @returns The resulting string in the format '[${index}]: ${content}'.
 */
function addSourceIndex(index: number, content: string): string {
	return `[${index}]: ${content}`;
}

type SearchResult = [Document, number, number];

interface SearchKeywordParams {
	query_text: string;
	match_count: number; // int
	query_upload_ids: string[];
}

interface SearchSimilarityParams {
	query_embedding: unknown;
	match_count: number; // int
	query_upload_ids: string[];
}

interface SearchResponseRow {
	id: number;
	content: string;
	metadata: object;
	similarity: number;
	upload_id: string;
}

// adapted from https://github.com/hwchase17/langchainjs/blob/b2aa91941a2a8133ef644ca7af2e4a6f136e4eea/langchain/src/vectorstores/supabase.ts#L69
async function similaritySearchVectorWithScore(
	client: SupabaseClient,
	query_embedding: unknown,
	match_count: number,
	query_upload_ids: string[],
): Promise<SearchResult[]> {
	const matchDocumentsParams: SearchSimilarityParams = {
		query_embedding,
		match_count,
		query_upload_ids,
	};
	const pgClient = getDbInstance();
	const res = await pgClient.query(
		'SELECT match_document_embeddings_by_uploads($1, $2, $3)',
		[
			`[${matchDocumentsParams.query_embedding.toString()}]`, // = pgvector.toSql(query_embedding),
			matchDocumentsParams.match_count,
			matchDocumentsParams.query_upload_ids,
		],
	);
	const searches = [];
	for (let row of res.rows) {
		row = row.match_document_embeddings_by_uploads.split(
			/,(?=(?:(?:[^"]*"){2})*[^"]*$)/,
		);
		const rowRes = {
			id: parseInt(row[0].substring(1)),
			content: row[1].substring(1, row[1].length - 1),
			metadata: JSON.parse(
				row[2].substring(1, row[2].length - 1).replace(/""/g, '"'),
			),
			upload_id: row[3],
			similarity: parseFloat(row[4].substring(0, row[4].length - 1)),
		};
		searches.push(rowRes);
	}

	const result = (searches as SearchResponseRow[]).map(
		(resp): SearchResult => [
			new Document({
				metadata: { ...resp.metadata, uploadID: resp.upload_id },
				pageContent: resp.content,
			}),
			resp.similarity,
			resp.id,
		],
	);

	return result;
}

export class CustomVectorStoreRetriever extends BaseRetriever {
	lc_namespace: string[];
	similarityK = 5;
	keywordK = 5;
	minScore = 0.5;
	projectId: string;
	client: SupabaseClient;

	constructor(fields: {
		minScore?: number;
		projectId: string;
		client: SupabaseClient;
	}) {
		super();
		this.client = fields.client;
		this.projectId = fields.projectId;
		this.minScore = fields.minScore ?? this.minScore;
	}

	async similaritySearch(
		query: string,
		similarityK: number,
	): Promise<SearchResult[]> {
		const queryVector = await embeddings.embedQuery(query);
		const uploadIds = (
			await this.client
				.from('uploads')
				.select('id')
				.eq('project_id', this.projectId)
		).data.map(e => e.id);
		return similaritySearchVectorWithScore(
			this.client,
			queryVector,
			similarityK,
			uploadIds,
		);
	}

	protected async keywordSearch(
		query: string,
		k: number,
	): Promise<SearchResult[]> {
		const uploadIds = (
			await this.client
				.from('uploads')
				.select('id')
				.eq('project_id', this.projectId)
		).data.map(e => e.id);
		const kwMatchDocumentsParams: SearchKeywordParams = {
			query_text: query,
			match_count: k,
			query_upload_ids: uploadIds,
		};

		const pgClient = getDbInstance();

		const res = await pgClient.query(
			'SELECT kw_match_document_embeddings_by_uploads($1, $2, $3)',
			[
				kwMatchDocumentsParams.query_text,
				kwMatchDocumentsParams.match_count,
				kwMatchDocumentsParams.query_upload_ids,
			],
		);

		const searches = [];
		for (let row of res.rows) {
			row = row.kw_match_document_embeddings_by_uploads.split(
				/,(?=(?:(?:[^"]*"){2})*[^"]*$)/,
			);
			const rowRes = {
				id: parseInt(row[0].substring(1)),
				content: row[1].substring(1, row[1].length - 1),
				metadata: JSON.parse(
					row[2].substring(1, row[2].length - 1).replace(/""/g, '"'),
				),
				upload_id: row[3],
				similarity: parseFloat(row[4].substring(0, row[4].length - 1)),
			};
			searches.push(rowRes);
		}

		// if (error) {
		//   console.log(error);
		//   throw new Error(`Error searching for documents: ${error}`);
		// }

		return (searches as SearchResponseRow[]).map(resp => [
			new Document({
				metadata: { ...resp.metadata, uploadID: resp.upload_id },
				pageContent: resp.content,
			}),
			resp.similarity * 10,
			resp.id,
		]);
	}

	protected async hybridSearch(
		query: string,
		similarityK: number,
		keywordK: number,
	): Promise<SearchResult[]> {
		const similarity_search = this.similaritySearch(query, similarityK);

		const keyword_search = this.keywordSearch(query, keywordK);

		return Promise.all([similarity_search, keyword_search])
			.then(results => results.flat())
			.then(results => {
				const picks = new Map<number, SearchResult>();

				results.forEach(result => {
					const id = result[2];
					const nextScore = result[1];
					const prevScore = picks.get(id)?.[1];

					if (prevScore === undefined || nextScore > prevScore) {
						picks.set(id, result);
					}
				});

				return Array.from(picks.values());
			})
			.then(results => results.sort((a, b) => b[1] - a[1]));
	}

	async getRelevantDocuments(query: string): Promise<Document[]> {
		const searchResults = await this.hybridSearch(
			query,
			this.similarityK,
			this.keywordK,
		);

		return uniqBy(searchResults, ([doc]) => doc.pageContent).map(
			([doc], index) =>
				new Document({
					...doc,
					pageContent: addSourceIndex(index + 1, doc.pageContent),
				}),
		);
	}
}
