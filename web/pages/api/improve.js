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
  const completion = await openai.createCompletion(
    {
      model: 'text-davinci-003',
      prompt: generatePrompt(req.body),
      temperature: 0.7,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    },
    { responseType: 'stream' },
  );
  // res.status(200).json({ improvedText: completion.data.choices[0].text });
  // res.write(completion.data);
  completion.data.on('data', data => console.log(data.toString()));
  completion.data.on('data', data => {
    res.write(data.toString());
  });
}

function generatePrompt(longtext) {
  return `please improve the following Text's content, organization, and style, so that it can be published in a research paper. The most important thing is that you have to answer in the same language as the text. If the input is not in english don't respond in english

  ${longtext}
  `;
}
