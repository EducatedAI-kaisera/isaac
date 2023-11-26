/* eslint-disable import/no-anonymous-default-export */
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PostgresVectorStore } from '../../embeddings/vector-stores/postgres';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const message = req.body;

      await PostgresVectorStore.fromTexts(
        [message.content],
        [
          {
            uuid: message.id,
            role: message.metadata.role,
            type: message.metadata.type,
            manipulation_title: message.metadata.manipulation_title
              ? message.metadata.manipulation_title
              : null,
            sources: message.metadata.sources
              ? JSON.stringify(message.metadata.sources)
              : null,
            footnotes: message.metadata.footnotes
              ? JSON.stringify(message.metadata.footnotes)
              : null,
          },
        ],
        message.user_id,
        message.project_id,
        new OpenAIEmbeddings(),
        {
          tableName: 'chat_messages',
          queryName: 'match_chat_messages',
        },
      );

      res.status(200).json({ status: 'success' });
    } catch (err) {
      console.error('Error saving message to database', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
