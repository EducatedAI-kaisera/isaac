import { useHover } from '@mantine/hooks';
import {
	ArrowUpRight,
	MessageSquareIcon,
	MessageSquarePlusIcon,
	ScrollTextIcon,
	X,
} from 'lucide-react';
import React, { useState } from 'react';
import { ChatSessionType } from 'types/chat';

export default function ChatSessionCard({
	type,
	label,
	onClick,
	onOpenTabClick,
	onDeleteClick,
}: {
	type: ChatSessionType;
	label?: string;
	onClick: () => void;
	onOpenTabClick?: () => void;
	onDeleteClick?: () => void;
}) {
	const { ref, hovered } = useHover();

	return (
		<div className=" border rounded p-2 flex justify-between gap-1" ref={ref}>
			<div
				className="flex gap-2 items-center overflow-clip hover:text-isaac cursor-pointer"
				onClick={onClick}
			>
				<div className="text-gray-600">
					{type === 'CONVERSATION' && (
						<MessageSquareIcon strokeWidth={1} size={20} />
					)}
					{type === 'NEW' && (
						<MessageSquarePlusIcon strokeWidth={1} size={20} />
					)}
				</div>
				<p className="text-sm truncate ">
					{type === 'CONVERSATION' && label}
					{type === 'NEW' && 'New Chat Session'}
				</p>
			</div>
			<div className="flex gap-1">
				{hovered && type === 'CONVERSATION' && (
					<X
						size={20}
						onClick={onDeleteClick}
						className="text-gray-600 hover:text-isaac cursor-pointer"
						strokeWidth={1}
					/>
				)}
				<ArrowUpRight
					size={20}
					onClick={onOpenTabClick}
					className="text-gray-600 hover:text-isaac cursor-pointer"
					strokeWidth={1}
				/>
			</div>
		</div>
	);
}
