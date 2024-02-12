import EditorToolbar from '@components/AppHeader/EditorToolbar';
import SortableDDContainer from '@components/core/SortableDDContainer';
import SortableDDItem from '@components/core/SortableDDItem';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@components/ui/tooltip';
import useChatSessions from '@context/chatSessions.store';
import { useLiteratureReferenceStore } from '@context/literatureReference.store';
import { Panel, useUIStore } from '@context/ui.store';
import useDocumentTabs, { TabType } from '@hooks/useDocumentTabs';
import { commandKey } from '@lexical/utils/meta';
import { useHover } from '@mantine/hooks';
import clsx from 'clsx';
import {
	ArrowDownLeft,
	Book,
	Bookmark,
	BookUp,
	FileText,
	MessageSquare,
	Search,
	X,
} from 'lucide-react';
import React, { memo } from 'react';

const minimizableTabItem = [TabType.Chat, TabType.LiteratureSearch];

const EditorTabs = () => {
	const activeSidebar = useUIStore(s => s.activeSidebar);
	const { currentProjectTabs, closeTab, openDocument, handleTabOnSort } =
		useDocumentTabs();

	const openPanel = useUIStore(s => s.openPanel);
	const { setChatSidebar } = useChatSessions(s => s.actions);
	const setLiteratureSearch = useLiteratureReferenceStore(
		s => s.setLiteratureSearch,
	);

	const activeTab = currentProjectTabs?.find(tab => tab.active);

	return (
		<div className="flex">
			{currentProjectTabs?.length > 0 && (
				<EditorToolbar activeTabType={activeTab?.type} />
			)}

			<div className="inline-flex items-center overflow-x-auto scrollbar-hide">
				<SortableDDContainer
					sortDirection="horizontal"
					itemIds={currentProjectTabs?.map(i => i.source) || []}
					onSort={sortedIds => handleTabOnSort(sortedIds)}
				>
					{currentProjectTabs?.map((tab, idx) => (
						<SortableDDItem key={`tab-${idx}`} id={tab.source}>
							<TabItem
								idx={idx}
								type={tab.type}
								active={tab.active}
								text={tab.label}
								onClick={() => openDocument(tab)}
								onCloseClick={() => closeTab(tab.source)}
								onMinimize={
									minimizableTabItem.includes(tab.type)
										? () => {
												closeTab(tab.source);
												if (tab.type === TabType.Chat) {
													openPanel(Panel.CHAT_SESSIONS);
													setChatSidebar('DETAIL', {
														title: tab.label,
														sessionId: tab.source,
													});
												} else if (tab.type === TabType.LiteratureSearch) {
													openPanel(Panel.LITERATURE_SEARCH);
													setLiteratureSearch({
														keyword: tab.source,
													});
												}
										  }
										: undefined
								}
								activeSidebar={activeSidebar}
							/>
						</SortableDDItem>
					))}
				</SortableDDContainer>
			</div>
		</div>
	);
};

export default React.memo(EditorTabs);

type TabItemProps = {
	idx: number;
	type: TabType;
	active?: boolean;
	text: string;
	onCloseClick: () => void;
	onMinimize?: () => void;
	onClick: () => void;
	activeSidebar?: boolean;
};

const TabItem = memo(
	({
		idx,
		type,
		onCloseClick,
		active,
		text,
		onClick,
		activeSidebar,
		onMinimize,
	}: TabItemProps) => {
		const { hovered, ref } = useHover();

		return (
			<div
				ref={ref}
				className={clsx(
					'flex items-center w-[150px] h-8 gap-2 cursor-pointer hover:bg-accent px-2 transition-width select-none',
					active
						? 'border-t border-r border-t-isaac bg-transparent border-b border-b-transparent'
						: 'border-b border-r border-t border-t-transparent text-muted-foreground',
					activeSidebar && '',
				)}
				onClick={onClick}
			>
				<div>
					{type === 'SemanticScholar' && <Book strokeWidth={1.4} size={18} />}
					{type === 'UserUpload' && <BookUp strokeWidth={1.4} size={18} />}
					{type === 'Document' && <FileText strokeWidth={1.4} size={18} />}
					{type === 'LiteratureSearch' && (
						<Search strokeWidth={1.4} size={18} />
					)}
					{type === 'Chat' && <MessageSquare strokeWidth={1.4} size={18} />}
					{type === 'SavedReference' && (
						<Bookmark strokeWidth={1.4} size={18} />
					)}
				</div>

				<Tooltip>
					<TooltipTrigger asChild>
						<p className={clsx('w-[80px] flex-grow min-w-0 truncate text-sm ')}>
							{text}
						</p>
					</TooltipTrigger>
					<TooltipContent side="top" sideOffset={10}>
						<p>
							{text} |{' '}
							<strong>
								{commandKey} + {idx + 1}
							</strong>
						</p>
					</TooltipContent>
				</Tooltip>

				<div className="flex ">
					{onMinimize && (
						<ArrowDownLeft
							size={14}
							strokeWidth={1.2}
							className={clsx(
								'transition-width text-gray-500 hover:text-gray-800',
								hovered ? 'w-auto mr-1.5' : 'w-0',
							)}
							onClick={e => {
								onMinimize();
								e.stopPropagation();
							}}
						/>
					)}
					<X
						className="text-gray-500 hover:text-gray-800"
						onClick={e => {
							onCloseClick();
							e.stopPropagation();
						}}
						size={14}
						strokeWidth={1.2}
					/>
				</div>
			</div>
		);
	},
);
