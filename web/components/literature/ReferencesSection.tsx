import ImportMendeleyModal from '@components/literature/ImportMendeleyModal';
import ImportZoteroModal from '@components/literature/ImportZoteroModal';
import LiteratureSummaryPreview from '@components/literature/LiteratureSummaryPreview';
import ReferenceList from '@components/literature/ReferenceList';
import useLiteratureToPreview from '@components/literature/useLiteratureToPreview';
import { Input } from '@components/ui/input';
import { useLiteratureReferenceStore } from '@context/literatureReference.store';
import { useUser } from '@context/user';
import useDocumentTabs, {
	TabType,
	UniqueTabSources,
} from '@hooks/useDocumentTabs';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { useGetReference, useGetUserUploads } from '@resources/editor-page';
import Fuse from 'fuse.js';
import { ArrowUpRight, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
	ReferenceLiterature,
	UploadedFile,
} from 'types/literatureReference.type';

export enum ReferenceSourceFilter {
	ALL = 'ALL',
	SAVED = 'SAVED',
	UPLOADED = 'UPLOADED',
}

const References = () => {
	const { projectId } = useGetEditorRouter();
	const { user } = useUser();
	//
	const [refSearchInput, setRefSearchInput] = useState<string>('');
	const [referenceList, setReferenceList] = useState<ReferenceLiterature[]>();
	const [uploadedReferenceList, setUploadedReferenceList] =
		useState<UploadedFile[]>();

	const targetDOI = useLiteratureReferenceStore(
		s => s.savedReferenceDOIPreview,
	);
	const setTargetDOI = useLiteratureReferenceStore(
		s => s.setSavedReferenceDOIPreview,
	);
	const { literaturePreview } = useLiteratureToPreview(targetDOI);

	const { data: _referenceList } = useGetReference(projectId);
	const { data: userUploads } = useGetUserUploads(user?.id, projectId);
	const { openDocument } = useDocumentTabs();

	// Clientside Filter for reference
	const fuseInstances: Map<string, Fuse<any>> = new Map();
	const getFuseInstance = (dataList: any[], keys: string[]) => {
		const keyString = keys.join(',');
		let fuse = fuseInstances.get(keyString);

		if (!fuse) {
			fuse = new Fuse(dataList, {
				keys,
				threshold: 0.4,
				ignoreLocation: true,
				shouldSort: false,
			});
			fuseInstances.set(keyString, fuse);
		} else {
			fuse.setCollection(dataList);
		}

		return fuse;
	};

	const performSearch = (
		searchInput: string,
		dataList: any[],
		keys: string[],
	) => {
		if (
			!searchInput ||
			!dataList ||
			!Array.isArray(dataList) ||
			dataList.length === 0
		) {
			return dataList || [];
		}

		const fuse = getFuseInstance(dataList, keys);
		return fuse.search(searchInput).map(f => f.item);
	};

	useEffect(() => {
		const newReferenceList = performSearch(refSearchInput, _referenceList, [
			'title',
			'authors',
		]);
		setReferenceList(newReferenceList);
	}, [refSearchInput, _referenceList]);

	useEffect(() => {
		const newUploadedReferenceList = performSearch(
			refSearchInput,
			userUploads,
			['file_name', 'custom_citation.title'],
		);
		setUploadedReferenceList(newUploadedReferenceList);
	}, [refSearchInput, userUploads]);

	if (literaturePreview) {
		return (
			<div className="">
				<LiteratureSummaryPreview
					onClose={() => setTargetDOI(undefined)}
					{...literaturePreview}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full w-full overflow-y-scroll scrollbar-hide bg-white dark:bg-black">
			{/* HEADER */}
			<div className="flex justify-between items-top p-3">
				<p className="font-semibold text-sm flex gap-2 items-center">
					Saved References
				</p>
				<div>
					<ArrowUpRight
						size={20}
						onClick={() => {
							openDocument({
								type: TabType.SavedReference,
								source: UniqueTabSources.SAVED_REFERENCE_TAB,
								label: 'References',
							});
						}}
						className="text-gray-600 hover:text-isaac cursor-pointer hidden md:block"
						strokeWidth={1}
					/>
				</div>
			</div>

			{/* SEARCH INPUT */}
			<div className="flex flex-col gap-2  items-stretch">
				<div className="flex items-center flex-wrap gap-2 mb-2 relative px-3">
					<Input
						onChange={e => setRefSearchInput(e.target.value)}
						placeholder="Search your references..."
						className="bg-white dark:bg-inherit"
					/>
					<button className="absolute right-4" type="submit">
						<Search className="w-6 h-4" strokeWidth={1.4} />
					</button>
				</div>

				{/* LIST */}
				<ReferenceList
					referenceList={referenceList}
					uploadedReferenceList={uploadedReferenceList}
					onClick={ref => {
						setTargetDOI(ref.doi);
					}}
				/>
			</div>
			<ImportMendeleyModal />
			<ImportZoteroModal />
		</div>
	);
};

export default React.memo(References);
