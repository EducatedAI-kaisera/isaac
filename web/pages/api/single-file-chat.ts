/* eslint-disable import/no-anonymous-default-export */

import { supabase } from '@utils/supabase';
import { CallbackManager } from 'langchain/callbacks';
import {
	ConversationalRetrievalQAChain,
	LLMChain,
	loadQAStuffChain,
} from 'langchain/chains';
import { Document } from 'langchain/document';
import { BaseLLM } from 'langchain/llms/base';
import { OpenAIChat } from 'langchain/llms/openai';

import { PromptTemplate } from 'langchain/prompts';
import { BaseRetriever } from 'langchain/schema/retriever';
import { NextApiRequest, NextApiResponse } from 'next';
import { CustomVectorStoreRetriever } from '../../embeddings/vector-stores/postgres-single-file';

/**
 * Removes the index, square brackets, and colon from the first line of a string in the format '[${index}]: ${resp.content}' and returns the remaining content.
 *
 * @param s The input string in the format '[${index}]: ${resp.content}'.
 * @returns The remaining content without the index, square brackets, and colon in the first line.
 */
function removeSourceIndex(s: string): string {
	const content = s.replace(/^\[\d+\]: */, '');
	return content;
}

const nonStreamingLLM = new OpenAIChat({
	modelName: 'gpt-3.5-turbo-16k',
});

// Custom ConversationalRetrievalQAChain that uses a main LLM for answer generation, and another
// (non-streaming, cheaper) LLM for potential follow-up question generation

const questionGeneratorTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question. If the question is about a new topic, just repeat the question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

export default async function (req: NextApiRequest, res: NextApiResponse) {
	const { projectId } = req.query;
	const uploadId = req.query.uploadId as string;
	if (!projectId || typeof projectId === 'object') {
		return res.status(403).json({ message: 'projectId param missing' });
	}

	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('Content-Encoding', 'none');

	const qaTemplate = `
 You are a Isaac. A helpful assistant designed to answer questions from the given document context and always answer the queries in ${req.query.editorLanguage}. If the user asks you to summarise the document or give them a conclusion, just use the context provided to answer as best as you can.

 Given the following extracted parts of a long document and a question, create a final answer. If you don't know the answer, just say that you don't know. Don't try to make up an answer.
Context: {context}

Question: {question}
Helpful Answer:`;

	class CustomConversationalRetrievalQAChain extends ConversationalRetrievalQAChain {
		static fromLLM(
			llm: BaseLLM,
			retriever: BaseRetriever,
		): ConversationalRetrievalQAChain {
			const question_generator_prompt = PromptTemplate.fromTemplate(
				questionGeneratorTemplate,
			);
			const qa_prompt = PromptTemplate.fromTemplate(qaTemplate);

			const qaChain = loadQAStuffChain(llm, { prompt: qa_prompt });
			const questionGeneratorChain = new LLMChain({
				prompt: question_generator_prompt,
				llm: nonStreamingLLM,
			});
			const instance = new this({
				retriever,
				combineDocumentsChain: qaChain,
				questionGeneratorChain,
				returnSourceDocuments: true,
			});
			return instance;
		}
	}

	const model = new OpenAIChat({
		modelName: 'gpt-3.5-turbo-16k',
		maxTokens: -1,
		streaming: true,
		callbackManager: CallbackManager.fromHandlers({
			async handleLLMNewToken(token) {
				res.write(`data: ${JSON.stringify(token.toString())}\n\n`); // Send data as a JSON string
			},
		}),
	});

	const customDocumentsRetriever = new CustomVectorStoreRetriever({
		client: supabase,
		projectId,
		uploadId: uploadId,
	});

	const chain = CustomConversationalRetrievalQAChain.fromLLM(
		model,
		customDocumentsRetriever,
	);

	res.write(`data: ${JSON.stringify('[start]')}\n\n`);
	const { sourceDocuments } = await chain.call({
		question: req.query.question,
		chat_history: req.body,
	});

	const sources = await Promise.all(
		sourceDocuments.map(async (source: Document): Promise<Document> => {
			const res = await supabase
				.from('uploads')
				.select('file_name, citation')
				.eq('id', source.metadata.uploadID)
				.single();

			const { citation = null, file_name = null } = res.data ?? {};

			return {
				...source,
				// pageContent: removeSourceIndex(source.pageContent),

				metadata: {
					...source.metadata,
					citation,
					file_name,
				},
			};
		}),
	);

	if (sources.length > 0) {
		res.write(`data: ${JSON.stringify({ sources })}\n\n`);
	}
	res.write(`data: ${JSON.stringify('[end]')}\n\n`); // Send the 'end' event as a JSON string

	res.end();
}
