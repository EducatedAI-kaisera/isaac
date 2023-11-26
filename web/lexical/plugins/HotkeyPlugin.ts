import { Panel, useUIStore } from '@context/ui.store';
import useDocumentTabs from '@hooks/useDocumentTabs';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { allCommandKeys, hotKeys, tabNumberKeys } from 'data/shortcuts';
import { COMMAND_PRIORITY_NORMAL, KEY_MODIFIER_COMMAND } from 'lexical';
import { useEffect, useState } from 'react';

const HotkeyPlugin = () => {
	const [editor] = useLexicalComposerContext();
	const openPanel = useUIStore(s => s.openPanel);
	const closePanel = useUIStore(s => s.closePanel);
	const activePanel = useUIStore(s => s.activePanel);
	const toggleSideBar = useUIStore(s => s.toggleSideBar);
	const toggleDocumentComment = useUIStore(s => s.toggleDocumentComment);
	const setShowEditorCommand = useUIStore(s => s.setShowEditorCommand);
	const { toggleDocumentByTabIndex } = useDocumentTabs();
	const [pressedKey, setPressedKey] = useState<string>();

	// * Register hotkey
	useEffect(() => {
		editor.registerCommand(
			KEY_MODIFIER_COMMAND,
			event => {
				if (event.metaKey || event.ctrlKey) {
					// Check for command key press instead of ctrl key
					if (allCommandKeys.includes(event.key)) {
						event.preventDefault();
						event.stopPropagation();
						setPressedKey(event.key);
					}
				}

				return true;
			},
			COMMAND_PRIORITY_NORMAL,
		);
	}, []);

	// * Trigger the key because register event callback doesn't update when state is updated
	useEffect(() => {
		if (pressedKey === hotKeys.toggleSidebar.key) {
			toggleSideBar();
		} else if (pressedKey === hotKeys.isaacPanel.key) {
			activePanel === Panel.CHAT ? closePanel() : openPanel(Panel.CHAT);
		} else if (pressedKey === hotKeys.referencePanel.key) {
			activePanel === Panel.REFERENCES
				? closePanel()
				: openPanel(Panel.REFERENCES);
		} else if (pressedKey === hotKeys.notePanel.key) {
			activePanel === Panel.NOTES ? closePanel() : openPanel(Panel.NOTES);
		} else if (pressedKey === hotKeys.closePanel.key) {
			closePanel();
		} else if (tabNumberKeys.includes(pressedKey)) {
			toggleDocumentByTabIndex(Number(pressedKey) - 1);
		} else if (pressedKey === hotKeys.toggleComment.key) {
			toggleDocumentComment();
		} else if (pressedKey === hotKeys.openCommand.key) {
			setShowEditorCommand(true, { showAIFunctions: true });
		} else if (pressedKey === hotKeys.toggleTheme.key) {
			// toggleColorScheme(); // TODO: Rework this
		}
		setPressedKey(undefined);
	}, [pressedKey]);

	return null;
};

export default HotkeyPlugin;
