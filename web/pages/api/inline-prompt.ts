import { updateTokenUsageForFreeTier } from '@resources/updateTokenUsageForFreeTier';
import { AIModels } from 'data/aiModels.data';
import { performCompletion } from '../../utils/stream_response';

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req, res) {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('Content-Encoding', 'none');

	const userId = req.query.userId;
	let llmModel = req.query.llmModel;
	const user = await updateTokenUsageForFreeTier(userId);

	if (user.message!="success") {
		llmModel = AIModels.GPT_3_5;
	}

	await performCompletion(res, {
		model: llmModel || 'gpt-3.5-turbo',
		messages: [{ role: 'user', content: req.body }],
		temperature: 0.6,
		max_tokens: 2400,
		top_p: 1,
		stream: true,
	})
}
