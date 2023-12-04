import { performCompletion } from '../../utils/stream_response'

const createCompletion = async (req, res) => {
	const completion = await performCompletion(res, {
		model: 'text-davinci-002',
		prompt: generatePrompt(req.body.text, req.body.language),
		temperature: 0.6,
		max_tokens: 512,
	}, true);
	res.status(200).json({ translation: completion });
};

function generatePrompt(text, language) {
	return `Translate the following text into  ${language} :

 ${text}
`;
}

export default createCompletion;
