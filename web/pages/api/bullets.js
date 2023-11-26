/* eslint-disable import/no-anonymous-default-export */
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('Content-Encoding', 'none');

	const completion = await openai.createChatCompletion(
		{
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content:
						'You are a prolific and competent academic research writing assistant. Your writing style is scientific, precise and concise. You never add citations to your output, except the input already included them.',
				},

				{ role: 'user', content: req.body },
			],
			temperature: 0.6,
			max_tokens: 3500,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
			stream: true,
		},
		{ responseType: 'stream' },
	);

	completion.data.on('data', data => {
		res.write(data.toString());
	});
}

function generatePrompt(bullets) {
	return `Transform the bullet points to prose. You have to include all citations mentioned in the bullet points. You must transform it in the same language as the text. You are not allowed to translate the text to English.

  Here is an example:

  Bullet points:

  - Income is inequally distributed in every country (Bachmann et al., 2019, p.4)
  - In developing countries income is more unequally distributed than in developed countries
  - income inequality is bad for social cohesion and leads to tension in society
  - Politicians should fight income inequality

  Prose:

  Income inequality is a global phenomenon which affects every country worldwide (Bachmann et al., 2019, p.4). However, depending on the development level of a country income inequality can be more or less severe. As such, developing countries show a much higher prevalence of high-income inequality compared to developed countries. This is problematic for many reasons. One of the main problems is that income inequality has a detrimental effect on social cohesion and increases societal tensions. For a developing country that is dealing with many socio-economic issues, this heightens the risk of conflict and destabilisation. Hence, politicians should make the main priority to introduce policies that tackle income inequality.

  Bullet points:

  ${bullets}

  Prose:









  `;
}
