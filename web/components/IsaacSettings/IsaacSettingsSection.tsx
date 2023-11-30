import { Button } from '@components/ui/button';

import { Label } from '@components/ui/label';
import { Switch } from '@components/ui/switch';
import { useUser } from '@context/user';
import useRevokeMendeleyToken from '@hooks/api/mendeley/useMendeleyToken.delete';
import { useGetUserIntegration } from '@hooks/api/useUserIntegration.get';
import useRevokeZoteroToken from '@hooks/api/zotero/useZoteroToken.delete';
import { getMendeleyUserAuthorizationUrl } from '@resources/integration/mendeley';
import { useDeleteUser } from '@resources/user';
import axios from 'axios';
import { format } from 'date-fns';
import { CreditCard, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';
import React from 'react';
import toast from 'react-hot-toast';
const IsaacSettingsSection = () => {
	const { user, logout, userIsLoading } = useUser();

	const router = useRouter();
	const email = user?.email ?? '';

	const { data: userIntegration } = useGetUserIntegration();
	const { mutateAsync: mutateDeleteUser } = useDeleteUser({
		onSuccessCb: () => router.push('/'),
	});

	// TODO: Fix subscription
	const loadPortal = async () => {
		const { data } = await axios.get('/api/portal');
		router.push(data.url);
	};

	const { mutateAsync: revokeMendeleyIntegration } = useRevokeMendeleyToken();
	const { mutateAsync: revokeZoteroIntegration } = useRevokeZoteroToken();

	const handleMendeleyIntegrationCheck = (check: boolean) => {
		if (!check) {
			revokeMendeleyIntegration();
		} else {
			toast.loading('Setting up Mendeley integration');
			setTimeout(() => {
				getMendeleyUserAuthorizationUrl('');
			}, 1000);
		}
	};

	const handleZoteroIntegrationCheck = async (check: boolean) => {
		if (!check) {
			revokeZoteroIntegration();
		} else {
			const userId = user?.id;
			window.location.href = `/api/auth/zotero?userId=${userId}`;
		}
	};
	return (
		<div className="flex flex-col justify-between p-3">
			<p className="text-sm font-medium text-foreground mb-6">Settings</p>

			<div className="flex flex-col gap-6">
				<div>
					<p className="text-sm font-semibold">Third Party Integrations</p>
					<div className="flex mt-4 items-center space-x-2">
						<Switch
							checked={!!userIntegration?.mendeley}
							onCheckedChange={handleMendeleyIntegrationCheck}
							id="airplane-mode"
						/>
						<Label htmlFor="airplane-mode" className="text-gray-800">
							Mendeley
						</Label>
					</div>
					<div className="flex items-center space-x-2 mt-2">
						<Switch
							checked={!!userIntegration?.zotero}
							onCheckedChange={handleZoteroIntegrationCheck}
							id="airplane-mode"
						/>
						<Label htmlFor="airplane-mode" className="text-gray-800">
							Zotero
						</Label>
					</div>
				</div>
				{/* <div>
					{!userIsLoading && (
						<>
							<p className="text-sm font-semibold">Manage Subscription</p>
							<Button
								size="sm"
								className="mt-2"
								onClick={loadPortal}
								variant="outline"
							>
								<CreditCard className="mr-2 h-4 w-4" />
								Manage Subscription
							</Button>
						</>
					)}
				</div> */}
				<div>
					{user && (
						<>
							<p className="text-sm font-semibold mb-2">Account</p>
							{!userIsLoading && (
								<span className="text-sm text-gray-800">{email}</span>
							)}
							<div>
								{!userIsLoading && (
									<span className="text-sm text-gray-800">
										Created at:{' '}
										{format(new Date(user?.created_at), 'dd MMM yyyy')}
									</span>
								)}
							</div>
							<div className="flex flex-col gap-0">
								<Button
									size="sm"
									className="mt-2"
									onClick={loadPortal}
									variant="outline"
								>
									<CreditCard className="mr-2 h-4 w-4" />
									Manage Billing
								</Button>
								<Button
									size="sm"
									className="mt-2"
									onClick={logout}
									variant="destructive"
								>
									<LogOut className="mr-2 h-4 w-4" />
									Sign Out
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default IsaacSettingsSection;
