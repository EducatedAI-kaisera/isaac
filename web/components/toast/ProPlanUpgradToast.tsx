import { Button } from '@components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { toast } from 'sonner';

type Props = {
	target: 'AI' | 'storage' | 'model';
};

export const ProPlanUpgradeToast: React.FC<Props> = ({ target }) => {
	const router = useRouter();

	if (target === 'AI') {
		toast.warning(
			"You've reached your daily request limit. Upgrade to continue or try again tomorrow.",
			{
				action: {
					label: 'Upgrade',
					onClick: () => {
						router.push('/onboarding');
					},
				},
			},
		);
	} else if (target === 'storage') {
		toast.warning(
			"You've reached your storage limit. Upgrade to get unlimited storage.",
			{
				action: {
					label: 'Upgrade',
					onClick: () => {
						router.push('/onboarding');
					},
				},
			},
		);
	} else if (target === 'model') {
		toast.warning(
			'GPT-4 is only available for Isaac Pro users. Upgrade to access better models.',
			{
				action: {
					label: 'Upgrade',
					onClick: () => {
						router.push('/onboarding');
					},
				},
			},
		);
	}
	// Assuming the toast function is void and doesn't require a return value for this component.
	return null;
};
