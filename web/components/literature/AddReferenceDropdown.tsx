import { Button } from '@components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
	ReferenceSection,
	useLiteratureReferenceStore,
} from '@context/literatureReference.store';
import { useUser } from '@context/user';
import useUploadDocument from '@hooks/api/useUploadDocument';
import { useGetUserIntegration } from '@hooks/api/useUserIntegration.get';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import { useTour } from '@reactour/tour';
import { getMendeleyUserAuthorizationUrl } from '@resources/integration/mendeley';
import {
	BookmarkPlus,
	FileUp,
	FolderDown,
	FolderInput,
	Plus,
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const AddReferenceDropdown = () => {
	const { data: userIntegration } = useGetUserIntegration();
	const { projectId } = useGetEditorRouter();
	// const { isOpen: tutorialMode, setCurrentStep } = useTour();
	const { user } = useUser();

	const setShowMendeleyModal = useLiteratureReferenceStore(
		s => s.setShowMendeleyModal,
	);
	const setShowZoteroModal = useLiteratureReferenceStore(
		s => s.setShowZoteroModal,
	);

	const [isOpen, setIsOpen] = useState(false);

	const setReferenceSection = useLiteratureReferenceStore(
		s => s.setReferenceSection,
	);

	const { uploadFiles, isUploading } = useUploadDocument(projectId, {
		onSuccess: () => {
			setReferenceSection(ReferenceSection.SAVED_REFERENCES);
			// setRefSubSection(ReferenceSourceFilter.UPLOADED); // TODO: handle this
		},
	});

	// const handleSearchOptionClick = () => {
	// 	setReferenceSection(ReferenceSection.SEARCH_LITERATURE);
	// 	tutorialMode && setCurrentStep(p => p + 1);
	// };

	const handleUploadOptionClick: React.ChangeEventHandler<
		HTMLInputElement
	> = async e => {
		await uploadFiles(e.target.files);
		setIsOpen(false);
	};
	const handleMendeleyImportClick = () => {
		if (userIntegration?.mendeley?.access_token) {
			// Open Modal
			setShowMendeleyModal(true);
		} else {
			toast.loading('Setting up Mendeley integration');
			setTimeout(() => {
				getMendeleyUserAuthorizationUrl(projectId);
			}, 1000);
		}
	};

	const handleZoteroImportClick = async () => {
		if (userIntegration?.zotero) {
			setShowZoteroModal(true);
		} else {
			const userId = user.id;
			window.location.href = `/api/auth/zotero?userId=${userId}&projectId=${projectId}`;
		}
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					id="add-reference"
					variant="ghost"
					size="xs"
					disabled={isUploading}
				>
					<BookmarkPlus size={16} strokeWidth={1.4} className="mr-1" />
					<span>Add references</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="bottom" align="start">
				<DropdownMenuItem className="relative">
					<FileUp size={18} strokeWidth={1.6} className="mr-2" />
					Upload document
					<input
						onChange={handleUploadOptionClick}
						onClick={e => e.stopPropagation()}
						className="absolute top-0 block w-full opacity-0 cursor-pointer pin-r pin-t"
						type="file"
						name="documents[]"
						accept=".docx,.doc,.odt,.pptx,.xlsx,.csv,.tsv,.eml,.msg,.rtf,.epub,.html,.xml,.pdf,.png,.jpg"
					/>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleMendeleyImportClick}>
					<FolderInput size={18} strokeWidth={1.6} className="mr-2" />
					Mendeley Import
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleZoteroImportClick}>
					<FolderInput size={18} strokeWidth={1.6} className="mr-2" />
					Zotero Import
				</DropdownMenuItem>
				{/* <DropdownMenuItem onClick={handleZoteroImportClick} disabled>
					<FolderDown size={18} strokeWidth={1.6} className="mr-2" />
					Import BibTeX
				</DropdownMenuItem> */}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default AddReferenceDropdown;
