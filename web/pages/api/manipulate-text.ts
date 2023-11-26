import { updateTokenUsageForFreeTier } from '@resources/user';
import { AIModels } from 'data/aiModels.data';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req, res) {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('Content-Encoding', 'none');

	const userId = req.query.userId;
	let llmModel = req.query.llmModel;
	const user = await updateTokenUsageForFreeTier(userId);

	if (!user.is_subscribed) {
		llmModel = AIModels.GPT_3_5;
	}

	const completion = await openai.createChatCompletion(
		{
			model: llmModel || 'gpt-3.5-turbo',
			messages: [
				{ role: 'system', content: req.query.systemPrompt },
				{ role: 'user', content: req.body },
			],
			temperature: 0.3,
			max_tokens: 812,
			top_p: 1,
			stream: true,
		},
		{ responseType: 'stream' },
	);

	//@ts-expect-error
	completion.data.on('data', data => {
		res.write(data.toString());
	});
}
