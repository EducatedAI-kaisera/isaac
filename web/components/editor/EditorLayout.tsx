import BottomLeftFab from '@components/BottomLeftFab';
import AppMenuBar from '@components/editor/AppMenuBar';
import EditorBottomRightFab from '@components/editor/EditorBottomRightFab';
import { EquationModal } from '@components/editor/EquationModal';
import { SideBarWidth, useUIStore } from '@context/ui.store';
import { useUser } from '@context/user';
import { useBreakpoint } from '@hooks/misc/useBreakPoint';
import useAuthRedirect from '@hooks/useAuthRedirect';
import useDocumentTabs, { paperTypeTabs } from '@hooks/useDocumentTabs';
import useEditorShortcut from '@hooks/useEditorShortcut';
import { useElementSize } from '@mantine/hooks';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import clsx from 'clsx';
import { headerHeight } from 'data/style.data';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';

type Props = {
	children: ReactNode; // dedicated for the content in the middle
};

const FeedbackModal = dynamic(() => import('../core/FeedbackModal'), {
	ssr: false,
});

const DiscordBanner = dynamic(() => import('../DiscordBanner'), {
	ssr: false,
});
const CreateNewDocumentModal = dynamic(
	() => import('../core/CreateNewDocumentModal'),
	{
		ssr: false,
	},
);
const UpdateUploadedMetaModal = dynamic(
	() => import('../literature/UpdateUploadedMetaModal'),
	{
		ssr: false,
	},
);

const AppHeader = dynamic(() => import('../AppHeader'), {
	ssr: false,
});

const ProductGuideModal = dynamic(() => import('../core/ProductGuideModal'), {
	ssr: false,
});

const EditorTabs = dynamic(() => import('./EditorTabs'), {
	ssr: false,
});

// TODO: RENAME THIS TO APP LAYOUT INSTED
/*
 * Layout Component for Editor page that would contain the sidebar
 */
const EditorLayout = ({ children }: Props) => {
	useAuthRedirect();
	useEditorShortcut();

	const { activeDocument } = useDocumentTabs();
	const { user } = useUser();
	const { ref: editorRef, width: editorWidth } = useElementSize();
	const { width: editorMobileWidth } = useElementSize();
	const { isAboveMd, isBelowMd } = useBreakpoint('md');

	const uiStore = useUIStore(s => ({
		activePanel: s.activePanel,
		activeSidebar: s.activeSidebar,
		showDocumentComments: s.showDocumentComments,
		setEditorWidth: s.setEditorWidth,
		setTop: s.setEditorScrollTop,
	}));

	// Initialize analytics & user
	useEffect(() => {
		if (user) {
			// if (
			// 	user?.has_seen_tour === false &&
			// 	!tutorialMode &&
			// 	user?.is_subscribed
			// ) {
			// 	setTutorialMode(true);
			// 	updateSeenTour({ userId: user?.id });
			// }

			import('mixpanel-browser').then(mixpanel => {
				mixpanel.identify(user?.id);
				mixpanel.people.set_once({
					Email: user?.email,
					'First Login Date': new Date(),
				});
				mixpanel.people.set({
					'Last Login Date': new Date(),
				});
			});
		}
	}, [user]);
	// Updates the width to the store
	useEffect(() => {
		uiStore.setEditorWidth(editorWidth || editorMobileWidth);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editorWidth, editorMobileWidth]);

	return (
		<>
			{user?.has_seen_community_banner ?? true ? null : (
				<DiscordBanner user={user} />
			)}
			<main className={clsx(' dark:bg-black bg-white h-screen')}>
				{/* Main Header */}
				<AppHeader />
				<div className="flex">
					{/* FABS & Modals */}
					{/* <BottomLeftFab /> */}
					<UpdateUploadedMetaModal />
					<CreateNewDocumentModal />
					<EquationModal />
					<ProductGuideModal />
					<FeedbackModal userEmail={user?.email} />

					{/* Desktop workspace */}
					<div
						className="flex-grow"
						style={{
							height: `calc(100vh - ${headerHeight}px)`,
						}}
					>
						<div className="flex flex-col-reverse  w-full h-full lg:flex md:flex-row flex-nowrap ">
							<AppMenuBar />
							<Allotment separator={false} className="allotment">
								<Allotment.Pane
									preferredSize={400}
									minSize={250}
									maxSize={550}
									visible={!!uiStore.activePanel}
									className={clsx(
										'flex z-30 w-full border-r border-border h-full bg-white dark:bg-black ',
									)}
								>
									<Sidebar />
								</Allotment.Pane>

								{/* Editor */}
								<Allotment.Pane
									className={clsx(
										'flex flex-col w-full h-full bg-white dark:bg-black',
									)}
								>
									<EditorTabs />
									<EditorBottomRightFab />
									<div
										id="scrollable-editor-container"
										onScroll={e => {
											// eslint-disable-next-line @typescript-eslint/ban-ts-comment
											// @ts-ignore
											uiStore.setTop(e.target.scrollTop);
										}}
										className="scrollbar-hide relative flex justify-center w-full h-[calc(100vh-60px)] !overflow-y-scroll px-2 !overflow-x-hidden"
									>
										<div
											ref={editorRef}
											className={clsx(
												'w-full h-full pt-8 px-2 sm:px-4',
												uiStore.activePanel ? 'md:px-10' : 'md:px-16',
												paperTypeTabs.includes(activeDocument?.type)
													? uiStore.showDocumentComments
														? 'max-w-[68rem]'
														: 'max-w-5xl'
													: 'max-w-[90rem]',
												uiStore.activePanel &&
													paperTypeTabs.includes(activeDocument?.type) &&
													'mr-[0] sm:mr-[2vw] md:mr-[3vw] lg:mr-[4vw] xl:mr-[6vw]',
											)}
										>
											{children}
										</div>
									</div>
								</Allotment.Pane>

								{/* AI Panel */}
							</Allotment>
						</div>
					</div>
				</div>
			</main>
		</>
	);
};

export default EditorLayout;
