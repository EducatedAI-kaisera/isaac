import { performCompletion } from '../../utils/stream_response';

export default async function (req, res) {
	const completion = await performCompletion(
		res,
		{
			model: 'text-davinci-003',
			prompt: generatePrompt(req.body.topic),
			temperature: 0.3,
			max_tokens: 1504,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		},
		true,
	);
	res.status(200).json({ outline: completion });
}

function generatePrompt(topic) {
	return ` Create an outline for an academic paper on ${topic}`;
}
