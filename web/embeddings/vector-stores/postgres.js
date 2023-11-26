// Adapted from https://github.com/hwchase17/langchainjs/blob/66a30ae/langchain/src/vectorstores/supabase.ts#L131

import { getDbInstance } from '@utils/pgClient';
import { VectorStore } from 'langchain/vectorstores/base';
import { Document } from '../document-class';

// Initialize the client
const db = getDbInstance();

export class PostgresVectorStore extends VectorStore {
	constructor(embeddings, args) {
		super(embeddings, args);
		this.client = db;
		this.tableName = args.tableName || 'documents';
		this.queryName = args.queryName || 'match_documents';
		this.filter = args.filter;
	}

	async addDocuments(documents) {
		const texts = documents.map(({ pageContent }) => pageContent);

		return this.addVectors(
			await this.embeddings.embedDocuments(texts),
			documents,
		);
	}

	async addVectors(vectors, documents) {
		const rows = vectors.map((embedding, idx) => ({
			content: documents[idx].pageContent,
			embedding,
			metadata: documents[idx].metadata,
			user_id: documents[idx].user_id,
			project_id: documents[idx].project_id,
		}));

		const chunkSize = 500;
		for (let i = 0; i < rows.length; i += chunkSize) {
			const chunk = rows.slice(i, i + chunkSize);
			try {
				await this.client.tx(t => {
					const queries = chunk.map(row => {
						return this.client.none(
							'INSERT INTO $1:name (content, embedding, metadata, user_id, project_id) VALUES ($2, $3, $4, $5, $6)',
							[
								this.tableName,
								row.content,
								row.embedding,
								row.metadata,
								row.user_id,
								row.project_id,
							],
						);
					});
					return t.batch(queries);
				});
			} catch (error) {
				throw new Error(`Error inserting: ${error.message}`);
			}
		}
	}

	async similaritySearchVectorWithScore(query, k, user_id, project_id, filter) {
		if (filter && this.filter) {
			throw new Error('cannot provide both `filter` and `this.filter`');
		}

		const _filter = filter ?? this.filter ?? {};
		let filterValue = {};

		if (typeof _filter === 'function') {
			filterValue = _filter();
		} else if (typeof _filter === 'object') {
			filterValue = _filter;
		} else {
			throw new Error('invalid filter type');
		}

		const matchDocumentsParams = [
			query,
			k,
			user_id,
			project_id,
			JSON.stringify(filterValue), // Convert filter object to JSON string
		];

		const queryBuilder = `SELECT * FROM ${this.queryName}($1::vector, $2::integer, $3::text, $4::text, $5::jsonb)`;

		try {
			const searches = await this.client.any(
				queryBuilder,
				matchDocumentsParams,
			);
			const result = searches.map(resp => [
				new Document({
					metadata: resp.metadata,
					pageContent: resp.content,
				}),
				resp.similarity,
			]);
			return result;
		} catch (error) {
			throw new Error(
				`Error searching for documents: ${error.code} ${error.message} ${error.details}`,
			);
		}
	}

	static async fromTexts(
		texts,
		metadatas,
		user_id,
		project_id,
		embeddings,
		dbConfig,
	) {
		const docs = [];
		for (let i = 0; i < texts.length; i += 1) {
			const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
			const newDoc = new Document({
				pageContent: texts[i],
				metadata,
				user_id: user_id,
				project_id: project_id,
			});
			docs.push(newDoc);
		}
		return PostgresVectorStore.fromDocuments(docs, embeddings, dbConfig);
	}

	static async fromDocuments(docs, embeddings, dbConfig) {
		const instance = new this(embeddings, dbConfig);
		await instance.addDocuments(docs);
		return instance;
	}

	static async fromExistingIndex(embeddings, dbConfig) {
		const instance = new this(embeddings, dbConfig);
		return instance;
	}
}
