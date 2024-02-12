import { Button } from '@components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Copy, CopyCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ReferralDialog({ referralId }) {
	const [copied, setCopied] = useState(false);
	const referralLink = `${
		process.env.NODE_ENV === 'development'
			? 'http://localhost:3000'
			: 'https://isaaceditor.com'
	}/?ref=${referralId}`;
	const copyToClipboard = () => {
		navigator.clipboard.writeText(referralLink).then(
			() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			},
			() => {
				toast.error('Failed to copy text to clipboard');
			},
		);
	};
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="sm">Invite your friends</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Invite your friends</DialogTitle>
					<DialogDescription>
						For every friend you invite, you get one month of free access to
						Isaac Pro!
					</DialogDescription>
				</DialogHeader>

				<div className="flex items-center space-x-4">
					<Input value={referralLink} readOnly />
				</div>

				<DialogFooter>
					<Button onClick={copyToClipboard}>
						{copied ? (
							<CopyCheck className="h-4 w-4 mr-1" />
						) : (
							<Copy className="h-4 w-4 mr-1" />
						)}
						{copied ? ' Copied' : ' Copy'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
