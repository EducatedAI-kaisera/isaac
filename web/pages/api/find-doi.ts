/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestBody {
	doi: string;
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
	const { doi }: RequestBody = req.body;
	const SEMANTIC_SCHOLAR_API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;

	const response = await fetch(
		`http://api.semanticscholar.org/graph/v1/paper/DOI:${doi}?fields=title,abstract,authors,url,journal,citationCount,year,externalIds,openAccessPdf,publicationTypes`,
		{
			method: 'GET',
			headers: {
				'x-api-key': SEMANTIC_SCHOLAR_API_KEY,
			},
		},
	);

	const data = await response.json();

	if (data.error) {
		res.status(500).json({ error: data.error });
	}

	if (data.error) {
		// Check if the error is due to a missing paper
		if (data.error === `Paper with id DOI:${doi} not found`) {
				res.status(404).json({ error: data.error });
		} else {
				res.status(500).json({ error: data.error });
		}
} else {
		res.status(200).json({ literature: ( ( data.paperId ) ? [data] : [] ) });
}
}
}
