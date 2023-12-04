import { performCompletion } from '../../utils/stream_response';

const createCompletion = async (req, res) => {
	const completion = await performCompletion(res, {
		model: 'text-davinci-002',
		prompt: generatePrompt(req.body.citation),
		temperature: 0.6,
		max_tokens: 512,
	}, true);
	res.status(200).json({ similarsources: completion });
};

function generatePrompt(citation) {
	return `Show me similar papers to the following one:

 ${citation}
`;
}

export default createCompletion;
