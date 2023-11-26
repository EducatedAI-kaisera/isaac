import { Toggle } from '@components/ui/toggle';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@components/ui/tooltip';
import { Clipboard, Save } from 'lucide-react';
import React from 'react';

type Props = {
	onSaveClick: () => void;
	onCopyClick: () => void;
	buttonOpacity?: number;
};

// TODO: Styling Option that is not quick and dirty
const SaveAndCopyButton = ({
	onSaveClick,
	onCopyClick,
	buttonOpacity,
}: Props) => {
	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Toggle
						variant="ghost"
						size="sm"
						pressed={false}
						onClick={onSaveClick}
					>
						<Save size="16" opacity={buttonOpacity} />
					</Toggle>
				</TooltipTrigger>
				<TooltipContent className="mb-2 shadow-md text-neutral-500">
					<p className="text-sm">Save to Notes</p>
				</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<Toggle
						variant="ghost"
						size="sm"
						pressed={false}
						onClick={onCopyClick}
					>
						<Clipboard size="16" opacity={buttonOpacity} />
					</Toggle>
				</TooltipTrigger>
				<TooltipContent className="mb-2 mr-2 shadow-md text-neutral-500">
					<p className="text-sm">Copy to Clipboard</p>
				</TooltipContent>
			</Tooltip>
		</>
	);
};

export default SaveAndCopyButton;
