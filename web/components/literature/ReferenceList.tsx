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
	list: MergedItem[];
	onClick: (ref: ReferenceLiterature) => void;
	handleRemoveUpload?: (docId: string) => void;
};

const ReferenceList = ({ list, onClick }: Props) => {
	const { openDocument } = useDocumentTabs();
	const { mutateAsync: removeReference } = useDeleteReference();

	return (
		<div
			className="flex flex-col gap-2 pl-3 pr-2  max-h-[calc(100vh-210px)] overflow-y-auto"
			id="reference-list"
		>
			{list?.map(i => {
				return (
					<React.Fragment key={`card-${i.source}-${i.id}`}>
						{i.source === 'reference' && (
							<LiteratureCard
								key={i.id}
								onRemove={() =>
									confirm(
										`Are you sure to remove ${
											(i as ReferenceLiterature).title
										} from the saved references`,
									) && removeReference(i.id)
								}
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
											label:
												(i as UploadedFile)?.custom_citation?.title ||
												(i as UploadedFile).file_name,
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
	);
};

export default ReferenceList;
