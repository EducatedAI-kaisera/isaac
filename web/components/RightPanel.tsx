import Chat from '@components/chat/Chat';
import References from '@components/literature/ReferencesSection';
import Notes from '@components/notes/NotesSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Panel, useUIStore } from '@context/ui.store';
import { useElementSize } from '@mantine/hooks';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Library, MessageSquare, StickyNote } from 'lucide-react';
import { useEffect } from 'react';

const panelVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1 },
};

const RightPanel = () => {
	const activePanel = useUIStore(s => s.activePanel);
	const openPanel = useUIStore(s => s.openPanel);
	const setRightPanelWidth = useUIStore(s => s.setRightPanelWidth);
	const { ref: rightPanelRef, width: rightPanelWidth } = useElementSize();

	// Updates the width to the store
	useEffect(() => {
		setRightPanelWidth(rightPanelWidth);
	}, [rightPanelWidth]);

	return (
		<div
			id="right-panel"
			ref={rightPanelRef}
			className={clsx(
				'relative w-full flex flex-col h-full',
				'dark:bg-neutral-900 bg-desertStorm-100',
			)}
		>
			<Tabs
				defaultValue={Panel.CHAT}
				className="h-full w-full"
				value={activePanel}
			>
				<TabsList className="grid grid-cols-3 mt-4 mx-4">
					<TabsTrigger value={Panel.CHAT} onClick={() => openPanel(Panel.CHAT)}>
						<MessageSquare
							className={clsx(
								'w-4 h-4 mr-1',
								activePanel === Panel.CHAT
									? 'text-primary'
									: 'text-muted-foreground',
							)}
						/>{' '}
						Chat
					</TabsTrigger>
					<TabsTrigger
						value={Panel.REFERENCES}
						onClick={() => openPanel(Panel.REFERENCES)}
					>
						<Library
							className={clsx(
								'w-4 h-4 mr-1',
								activePanel === Panel.REFERENCES
									? 'text-primary'
									: 'text-muted-foreground',
							)}
						/>
						References
					</TabsTrigger>
					<TabsTrigger
						value={Panel.NOTES}
						onClick={() => openPanel(Panel.NOTES)}
					>
						{' '}
						<StickyNote
							className={clsx(
								'w-4 h-4 mr-1',
								activePanel === Panel.NOTES
									? 'text-primary'
									: 'text-muted-foreground',
							)}
						/>
						Notes
					</TabsTrigger>
				</TabsList>
				<TabsContent value={Panel.CHAT}>
					<Chat />
				</TabsContent>
				<TabsContent value={Panel.REFERENCES}>
					<References />
				</TabsContent>
				<TabsContent value={Panel.NOTES}>
					<Notes />
					{/* </motion.div> */}
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default RightPanel;
