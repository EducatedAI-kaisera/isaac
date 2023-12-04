import cheerio from 'cheerio';

const BASE_URL = 'https://lite.duckduckgo.com';

export interface SearchRequest {
	query: string;
	timerange: string;
	region: string;
}

export interface SearchResponse {
	status: number;
	html: string;
	url: string;
}

export interface SearchResult {
	title: string;
	body: string;
	url: string;
}

export async function getHtml({
	query,
	timerange,
	region,
}: SearchRequest): Promise<SearchResponse> {
	const formData = new URLSearchParams({
		q: query.slice(0, 495), // DDG limit
		df: timerange,
		kl: region,
	});

	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		Accept:
			'text/html,application/xhtml+xml,application/xmlq=0.9,image/avif,image/webp,image/apng,*/*q=0.8,application/signed-exchangev=b3q=0.7',
		AcceptEncoding: 'gzip, deflate, br',
		// 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
		// Cookie: `kl=${search.region} df=${search.timerange}`,
	};

	const response = await fetch(`${BASE_URL}/lite/`, {
		method: 'POST',
		headers,
		body: formData.toString(),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch: ${response.status} ${response.statusText}`,
		);
	}

	return {
		status: response.status,
		html: await response.text(),
		url: response.url,
	};
}

function htmlToSearchResults(html: string, numResults: number): SearchResult[] {
	// console.log("htmlToSearchResults", numResults)
	const $ = cheerio.load(html);
	const results: SearchResult[] = [];

	const numTables = $('table').length;

	if (!numTables) return results;

	// Extract zero-click info, if present
	const zeroClickLink = $(
		`table:nth-of-type(${numTables - 1}) tr td a[rel="nofollow"]`,
	).first();
	if (zeroClickLink.length > 0) {
		results.push({
			title: zeroClickLink.text(),
			body: $('table:nth-of-type(2) tr:nth-of-type(2)').text().trim(),
			url: zeroClickLink.attr('href') ?? '',
		});
	}

	// Extract web search results
	const upperBound = zeroClickLink.length > 0 ? numResults - 1 : numResults;
	const webLinks = $(
		`table:nth-of-type(${numTables}) tr:not(.result-sponsored) .result-link`,
	).slice(0, upperBound);
	const webSnippets = $(
		`table:nth-of-type(${numTables}) tr:not(.result-sponsored) .result-snippet`,
	).slice(0, upperBound);
	webLinks.each((i, element) => {
		const link = $(element);
		const snippet = $(webSnippets[i]).text().trim();

		results.push({
			title: link.text(),
			body: snippet,
			url: link.attr('href') ?? '',
		});
	});

	return results;
}

export async function webSearch(
	search: SearchRequest,
	numResults: number,
): Promise<SearchResult[]> {
	const response = await getHtml(search);

	let results: SearchResult[];
	if (response.url === `${BASE_URL}/lite/`) {
		results = htmlToSearchResults(response.html, numResults);
	} else {
		// You can handle this case differently or throw an error if you don't expect this behavior
		throw new Error('Unexpected response URL');
	}

	return results;
}
