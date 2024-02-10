import { Button } from '@components/ui/button';
import { FileDown } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

const ReferenceExportButton = ({ referenceList, projectName }) => (
	<Button
		size="xs"
		variant="ghost"
		onClick={() => downloadAsBibTex({ referenceList, projectName })}
	>
		<FileDown size={16} strokeWidth={1.4} className="mr-1" />
		Export BibTeX
	</Button>
);

export default ReferenceExportButton;

const formatAuthor = author => `${author.lastName}, ${author.firstName}`;

const referenceLiteratureToBibTeX = ({ authors, title, year, doi, id }) => {
	const formattedAuthors = authors.map(formatAuthor).join(' and ');
	return `@article{${id},
  author = {${formattedAuthors}},
  title = {${title}},
  year = {${year}},
  doi = {${doi}},
}
`;
};

const downloadAsBibTex = ({ referenceList, projectName }) => {
	if (!referenceList.length) {
		toast.error(
			'No references found to generate BibTeX. Please upload or create references before exporting to BibTeX.',
		);
		return;
	}

	const bibTextEntries = referenceList
		.map(ref => {
			if (ref.authors) {
				return referenceLiteratureToBibTeX(ref);
			} else if (ref.citation && ref.citation !== null) {
				const { name, metadata } = ref.citation;
				return referenceLiteratureToBibTeX({
					authors: [{ lastName: name }],
					title: name,
					year: metadata.year,
					doi: ref.doi,
					id: ref.id,
				});
			} else if (ref.custom_citation) {
				const { title, year, authors } = ref.custom_citation;
				return `@article{${ref.id},
  author = {${authors?.join(' and ')}},
  title = {${title}},
  year = {${year}},
  doi = {${ref.doi}},
}
`;
			}
			return '';
		})
		.join('\n');

	const element = document.createElement('a');
	element.setAttribute(
		'href',
		`data:application/x-bibtex;charset=utf-8,${encodeURIComponent(
			bibTextEntries,
		)}`,
	);
	element.setAttribute('download', `${projectName}_references.bib`);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
};
