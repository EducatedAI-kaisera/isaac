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
import { Copy, CopyCheck, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ReferralDialogProps {
	referralId: string;
	location: 'settings' | 'header';
}

export function ReferralDialog({ referralId, location }: ReferralDialogProps) {
	const [copied, setCopied] = useState(false);
	const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/?ref=${referralId}`;
	const copyToClipboard = () => {
		const message =
			"Hey, there's this great AI app Isaac that I've been using for my research. You should try it out: ";
		navigator.clipboard.writeText(message + referralLink).then(
			() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			},
			() => {
				toast.error('Failed to copy text to clipboard');
			},
		);
	};

	const renderButtonBasedOnLocation = () => {
		if (location === 'settings') {
			return (
				<Button className="text-isaac mt-4" variant="link" size="sm">
					<Zap className="h-3 w-3 mr-1" /> Isaac Pro for free
				</Button>
			);
		} else if (location === 'header') {
			return (
				<Button size="xs" variant="link" className="text-isaac mr-1">
					<Zap className="h-3 w-3 mr-1" /> Isaac Pro for free
				</Button>
			);
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>{renderButtonBasedOnLocation()}</DialogTrigger>
			<DialogContent className="sm:max-w-[555px]">
				<DialogHeader>
					<DialogTitle>Invite your friends</DialogTitle>
					<DialogDescription>
						One month of Isaac Pro for free for every friend who signs up using
						your link!
					</DialogDescription>
				</DialogHeader>

				<div className="flex items-center space-x-4">
					<Input value={referralLink} readOnly />
				</div>

				<DialogFooter>
					<Button onClick={copyToClipboard} size="sm">
						{copied ? (
							<CopyCheck className="h-4 w-4 mr-2" />
						) : (
							<Copy className="h-4 w-4 mr-2" />
						)}
						{copied ? ' Copied' : ' Copy'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
