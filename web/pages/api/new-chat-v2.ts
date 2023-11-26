import { updateTokenUsageForFreeTier } from '@resources/user';
import { AIModels } from 'data/aiModels.data';
import { NextApiRequest } from 'next';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { ChatContext } from 'types/chat';

type Payload = {
	userId: string;
	context: ChatContext;
	messages: ChatCompletionRequestMessage[];
	max_tokens: number;
	projectId: string;
	uploadId: string;
	temperature: number;
};

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const singleReferenceEndpoint = `${process.env.NEXT_PUBLIC_APP_URL}/api/retrieve-single-reference-embeddings`;
const projectReferenceEndpoint = `${process.env.NEXT_PUBLIC_APP_URL}/api/retrieve-reference-embeddings`;
const realtimeEndpoint = `${process.env.NEXT_PUBLIC_APP_URL}/api/search-web`;

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res) {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('Content-Encoding', 'none');

	const {
		userId,
		messages,
		max_tokens,
		temperature,
		projectId,
		uploadId,
		context,
	} = JSON.parse(req.body) as Payload;
	let { llmModel } = JSON.parse(req.body);
	const user = await updateTokenUsageForFreeTier(userId);

	if (!user.is_subscribed) {
		llmModel = AIModels.GPT_3_5;
	}
	console.log({ context });
	if (context === 'references') {
		const prompt = messages.pop().content;
		if (uploadId) {
			const res = await fetch(singleReferenceEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt, uploadId }),
			});
			const injectedDoc = await res.json();
			console.log({ injectedDoc });
			messages.push({
				role: 'user',
				content: `${prompt}\n Document: ${injectedDoc}`,
			});
		} else {
			const res = await fetch(projectReferenceEndpoint, {
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
				body: JSON.stringify({ prompt, projectId }),
			});
			const injectedDoc = await res.json();
			console.log({ injectedDoc });
			messages.push({
				role: 'user',
				content: `${prompt}\n Document: ${injectedDoc}`,
			});
		}
	}

	if (context === 'realtime') {
		const prompt = messages.pop().content;
		const currentDate = new Date();
		const dateString = currentDate.toString();
		const res = await fetch(realtimeEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				query: prompt,
			}),
		});
		const realtimeContext = await res.json();
		console.log({ realtimeContext });
		messages.push({
			role: 'user',
			content: `Web search results:\n\n ${JSON.stringify(
				realtimeContext,
			)}\nCurrent date:${dateString}\n\nInstructions:Using the provided web search results, write a comprehensive reply to the given query. Make sure to cite results using [[number](URL)] notation after the reference. If the provided search results refer to multiple subjects with the same name, write separate answers for each subject.\nQuery:${prompt} `,
		});
	}

	const completion = await openai.createChatCompletion(
		{
			model: llmModel || 'gpt-3.5-turbo',
			messages,
			temperature,
			max_tokens,
			top_p: 1,
			stream: true,
		},

		{ responseType: 'stream' },
	);

	// @ts-expect-error
	completion.data.on('data', data => {
		res.write(data.toString());
	});
}
