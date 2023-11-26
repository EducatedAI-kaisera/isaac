import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const createCompletion = async (req, res) => {
  const completion = await openai.createCompletion({
    model: 'text-davinci-002',
    prompt: generatePrompt(req.body.statement),
    temperature: 0.6,
    max_tokens: 512,
  });
  res.status(200).json({ sources: completion.data.choices[0].text });
};

function generatePrompt(statement) {
  return `Find academic sources for the following statement:

 ${statement}
`;
}

export default createCompletion;
