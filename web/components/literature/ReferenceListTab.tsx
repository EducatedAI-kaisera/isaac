import LiteratureSearchInput from '@components/literature/LiteratureSearchInput';
import { Badge } from '@components/ui/badge';
import ClampedParagraph from '@components/ui/clamped-paragraph';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@components/ui/table';
import useAddReference from '@hooks/api/useAddToReference';
import useReferenceListOperation from '@hooks/api/useReferenceListOperation';
import { TabType } from '@hooks/useDocumentTabs';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { useLocalStorage } from '@mantine/hooks';
import { useDeleteReference, useGetReference } from '@resources/editor-page';
import {
	GetLiteraturePayload,
	LiteratureResponse,
} from '@resources/literature.api';
import clsx from 'clsx';
import { capitalize, startCase } from 'lodash';
import { Bookmark } from 'lucide-react';
import React, { useState } from 'react';
import {
	ReferenceLiterature,
	ReferenceSource,
	ReferenceType,
	SemanticScholarReference,
	UploadedFile,
} from 'types/literatureReference.type';

type Props = {
	active: boolean;
};

const ReferenceListTab = ({ active }: Props) => {
	const { openDocument, setTargetDOI, setRefSearchInput, mergedItem } =
		useReferenceListOperation();

	const { projectId } = useGetEditorRouter();
	const [literatureSearchPayload, setLiteratureSearchPayload] =
		useState<GetLiteraturePayload>();

	const [searchedResultInLocalStorage, setSearchedResultInLocalStorage] =
		useLocalStorage<Record<string, LiteratureResponse>>({
			key: 'literature-search',
			defaultValue: {},
		});

	const { data: savedReferenceList } = useGetReference(projectId);
	const { mutateAsync: addReference } = useAddReference();
	const { mutateAsync: removeReference } = useDeleteReference();

	const handleSaveReference = (lit: SemanticScholarReference) => {
		addReference({
			projectId,
			papers: [
				{
					authors: lit.authors,
					title: lit.title,
					doi: lit.externalIds.DOI,
					year: lit.year,
					sourceId: ReferenceSource.SEMANTIC_SCHOLAR,
				},
			],
		});
	};

	return (
		<div
			className={clsx('max-w-[1400px] mx-auto', active ? 'block' : 'hidden')}
		>
			<LiteratureSearchInput
				onSubmit={data => {
					setLiteratureSearchPayload(data);
				}}
			/>

			<>
				{!!mergedItem?.length && (
					<div className="mt-6 h-[calc(100vh-220px)] overflow-scroll">
						<Table className="">
							<TableHeader>
								<TableRow>
									<TableHead className="w-[48%]">References</TableHead>
									<TableHead className="w-[48%]">TLDR</TableHead>
									<TableHead className="w-[4%]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{mergedItem?.map(item => {
									const title =
										item.source === 'reference'
											? (item as ReferenceLiterature).title
											: (item as UploadedFile).custom_citation.title ||
											  (item as UploadedFile).file_name;

									const authors =
										item.source === 'reference'
											? (item as ReferenceLiterature).authors.map(a => a.name)
											: (item as UploadedFile).custom_citation.authors;

									const authorsString = authors?.length
										? authors.join(', ') +
										  ((authors.length || 0) > 3 ? ' et al.' : '')
										: 'Authors Unspecified';

									const year =
										item.source === 'reference'
											? (item as ReferenceLiterature).year
											: (item as UploadedFile).custom_citation.year;

									const hasPdf =
										item.source === 'reference'
											? !!(item as ReferenceLiterature).pdf
											: true;

									const openDocumentProps =
										item.source === 'reference'
											? {
													source: (item as ReferenceLiterature).pdf,
													label: (item as ReferenceLiterature).title,
													type: TabType.SemanticScholar,
											  }
											: {
													source: (item as UploadedFile).id,
													label:
														(item as UploadedFile).custom_citation.title ||
														(item as UploadedFile).file_name,
													type: TabType.UserUpload,
											  };

									const tldr =
										item.source === 'reference'
											? (item as ReferenceLiterature).tldr
											: '';

									const type =
										item.source === 'reference'
											? (item as ReferenceLiterature).type
											: ReferenceType.USER_UPLOAD;

									return (
										<TableRow key={item.id}>
											<TableCell className="align-top ">
												<p className="font-medium">{title}</p>
												<div className="text-sm leading-7 break-words text-neutral-700 dark:text-neutral-400 line-clamp-1 ">
													<p>{authorsString}</p>
													<div className="flex gap-2">
														<Badge
															variant="accent"
															className="text-xs"
															key={type}
														>
															{startCase(
																capitalize(type || ReferenceType.JOURNAL),
															)}
														</Badge>
														{year && <Badge variant="accent">{year}</Badge>}
														{hasPdf && (
															<Badge
																className="cursor-pointer"
																variant="accent"
																onClick={() => {
																	openDocument(openDocumentProps);
																}}
															>
																<span>View PDF</span>
															</Badge>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell className="max-w-[300px] align-top">
												<ClampedParagraph
													text={tldr}
													EmptyText={
														<span className="text-gray-400 h-full italic">
															No TLDR
														</span>
													}
												/>
											</TableCell>
											<TableCell className="align-top ">
												{item.source === 'reference' && (
													<Bookmark
														onClick={() =>
															confirm('Are you sure to delete reference? ') &&
															removeReference((item as ReferenceLiterature).id)
														}
														className={clsx(
															'text-right mt-1 cursor-pointer hover:stroke-yellow-500 hover:stroke-1',
															'fill-yellow-400 stroke-yellow-500',
														)}
														size={20}
														strokeWidth={0.6}
													/>
												)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}
			</>
		</div>
	);
};

export default ReferenceListTab;
