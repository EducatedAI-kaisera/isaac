import AddReferenceDropdown from '@components/literature/AddReferenceDropdown';
import LiteratureCard from '@components/literature/LiteratureCard';
import UploadedDocCard from '@components/literature/UploadedDocCard';
import { Button } from '@components/ui/button';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@components/ui/select';
import useDocumentTabs, { TabType } from '@hooks/useDocumentTabs';
import { useDeleteReference } from '@resources/editor-page';
import { FileDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
	ReferenceLiterature,
	ReferenceSourceFilter,
	UploadedFile,
} from 'types/literatureReference.type';

type MergedItem = (ReferenceLiterature | UploadedFile) & {
	source: 'reference' | 'uploaded';
};

type Props = {
	referenceList?: ReferenceLiterature[];
	uploadedReferenceList?: UploadedFile[];
	onClick: (ref: ReferenceLiterature) => void;
	handleRemoveUpload?: (docId: string) => void;
};

const ReferenceList = ({
	referenceList,
	uploadedReferenceList,
	onClick,
}: Props) => {
	const [filter, setFilter] = useState<ReferenceSourceFilter>(
		ReferenceSourceFilter.ALL,
	);
	const [allItems, setAllItems] = useState<MergedItem[]>([]);
	const { openDocument } = useDocumentTabs();
	const { mutateAsync: removeReference } = useDeleteReference();

	// Merge the two list
	useEffect(() => {
		if (referenceList && uploadedReferenceList) {
			let _referenceList: ReferenceLiterature[] = [];
			let _uploadedList: UploadedFile[] = [];

			if (filter === ReferenceSourceFilter.SAVED) {
				_referenceList = referenceList;
			} else if (filter === ReferenceSourceFilter.UPLOADED) {
				_uploadedList = uploadedReferenceList;
			} else {
				_uploadedList = uploadedReferenceList;
				_referenceList = referenceList;
			}

			const mergedList = [
				..._referenceList.map(i => ({ ...i, source: 'reference' })),
				..._uploadedList.map(i => ({
					...i,
					source: 'uploaded',
				})),
			].sort(
				(b, a) =>
					new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
			);

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			setAllItems([...mergedList]);
		}
	}, [referenceList, uploadedReferenceList, filter]);

	return (
		<div className="flex flex-col gap-4">
			<div className="px-3">
				<div className="flex flex-col gap-1.5 items-center justify-between ">
					<Select
						value={filter}
						onValueChange={value => setFilter(value as ReferenceSourceFilter)}
					>
						<SelectTrigger className="w-full h-6">
							<SelectValue placeholder="Select a document type" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Reference Type</SelectLabel>
								<SelectItem value="ALL">All</SelectItem>
								<SelectItem value="SAVED">Saved</SelectItem>
								<SelectItem value="UPLOADED">Uploaded</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<div className="flex flex-wrap w-full gap-x-2">
						<AddReferenceDropdown />
						<Button
							size="xs"
							variant="ghost"
							onClick={() => downloadAsBibTex(allItems)}
						>
							<FileDown size={16} strokeWidth={1.4} className="mr-1" />
							Export BibTeX
						</Button>
					</div>
				</div>
			</div>
			<div
				className="flex flex-col gap-2 px-3  max-h-[calc(100vh-210px)] overflow-y-auto"
				id="reference-list"
			>
				{allItems?.map(i => {
					return (
						<React.Fragment key={`card-${i.source}-${i.id}`}>
							{i.source === 'reference' && (
								<LiteratureCard
									key={i.id}
									onRemove={() => removeReference(i.id)}
									title={(i as ReferenceLiterature).title}
									onClick={() => onClick(i as ReferenceLiterature)}
									type={(i as ReferenceLiterature).type}
									authors={(i as ReferenceLiterature).authors.map(
										author => author.name,
									)}
									year={Number((i as ReferenceLiterature).year)}
									source="Search"
									added={true}
								/>
							)}
							{i.source === 'uploaded' && (
								<>
									<UploadedDocCard
										key={i.id}
										id={i.id}
										title={
											(i as UploadedFile).custom_citation?.title ||
											(i as UploadedFile).file_name
										}
										fileName={(i as UploadedFile).file_name}
										year={(i as UploadedFile).custom_citation?.year}
										authors={(i as UploadedFile).custom_citation?.authors}
										created_at={(i as UploadedFile).created_at}
										onClick={() => {
											openDocument({
												source: (i as UploadedFile).id,
												label: (i as UploadedFile).file_name,
												type: TabType.UserUpload,
											});
										}}
									/>
								</>
							)}
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
};

export default ReferenceList;

function referenceLiteratureToBibTeX(reference) {
	const authors = reference.authors
		.map(author => `${author.lastName}, ${author.firstName}`)
		.join(' and ');
	const title = reference.title;
	const year = reference.year;
	const doi = reference.doi;
	const id = reference.id;

	let bibTeXEntry = `@article{${id},\n`;
	bibTeXEntry += `  author = {${authors}},\n`;
	bibTeXEntry += `  title = {${title}},\n`;
	bibTeXEntry += `  year = {${year}},\n`;
	bibTeXEntry += `  doi = {${doi}},\n`;
	bibTeXEntry += `}\n`;

	return bibTeXEntry;
}

const downloadAsBibTex = referenceList => {
	let bibTextEntries = '';

	if (referenceList.length === 0) {
		toast.error(
			'No references found to generate BibTeX. Please upload or create references before exporting to BibTeX.',
		);
		return;
	}

	for (let i = 0; i < referenceList.length; i++) {
		const currentRef = referenceList[i];

		if ('authors' in currentRef) {
			// It's a ReferenceLiterature
			const bibTeXEntry = referenceLiteratureToBibTeX(currentRef);
			bibTextEntries += bibTeXEntry;
		} else if ('citation' in currentRef && currentRef.citation !== null) {
			// It's an UploadedFile with citation
			const { name, metadata } = currentRef.citation;
			const authors = [{ lastName: name }];
			const title = name;
			const year = metadata.year;
			const doi = currentRef.doi;
			const id = currentRef.id;

			const bibTeXEntry = referenceLiteratureToBibTeX({
				authors,
				title,
				year,
				doi,
				id,
			});
			bibTextEntries += bibTeXEntry;
		} else if (currentRef.custom_citation) {
			// It's an UploadedFile with "custom_citation"
			const { title, year, authors } = currentRef.custom_citation;
			const authorString = authors?.join(' and ');
			const doi = currentRef.doi;
			const id = currentRef.id;

			const bibTeXEntry =
				`@article{${id},\n` +
				`  author = {${authorString}},\n` +
				`  title = {${title}},\n` +
				`  year = {${year}},\n` +
				`  doi = {${doi}},\n` +
				`}\n`;

			bibTextEntries += bibTeXEntry;
		}

		// Add a newline between entries (optional, adjust as needed)
		if (i < referenceList.length - 1) {
			bibTextEntries += '\n';
		}
	}

	const element = document.createElement('a');
	element.setAttribute(
		'href',
		'data:application/x-bibtex;charset=utf-8,' +
			encodeURIComponent(bibTextEntries),
	);
	element.setAttribute('download', 'isaac-references.bib');

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
};
