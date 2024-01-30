import { useGetLiteratureDetails } from '@resources/literature.api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
	LiteraturePreview,
	ReferenceType,
} from 'types/literatureReference.type';

const useLiteratureToPreview = (doi: string) => {
	const [literaturePreview, setLiteraturePreview] =
		useState<LiteraturePreview>();

	const { refetch, isError, data } = useGetLiteratureDetails(doi);

	if (isError) {
		toast.error('Failed to fetch literature preview');
	}

	if (data) {
		const { openAccessPdf, externalIds, ...lit } = data;
		setLiteraturePreview({
			...lit,
			pdfUrl: openAccessPdf?.url,
			doi: externalIds?.DOI,
			type: ReferenceType.STANDARD,
		});
	}

	useEffect(() => {
		if (doi === undefined) {
			setLiteraturePreview(undefined);
		} else {
			refetch();
		}
	}, [doi]);

	return { literaturePreview, setLiteraturePreview };
};

export default useLiteratureToPreview;
