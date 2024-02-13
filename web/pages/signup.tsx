import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { AuthLayout } from '@components/landing/AuthLayout';
import { Icons } from '@components/landing/icons';
import { cn } from '@components/lib/utils';
import { LandingButton } from '@components/ui/button-landing';
import { LandingInput } from '@components/ui/input-landing';
import { Label } from '@components/ui/label';
import { useRouter } from 'next/router';

import mixpanel from 'mixpanel-browser';
import { toast } from 'sonner';
import { useUser } from '../context/user';
import { supabase } from '../utils/supabase';

export default function Signup() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const router = useRouter();
	const { user, loginWithGoogle } = useUser();

	async function signUpWithEmail(e) {
		e.preventDefault();
		setIsLoading(true);
		mixpanel.track('Sign Up', { provider: 'email' });

		try {
			const { data, error } = await supabase.auth.signUp({
				email: email,
				password: password,
			});

			if (error) {
				throw error;
			}

			// Check for referrer ID in local storage
			const referrerId = localStorage.getItem('isaac-referrer-id');
			if (referrerId) {
				// Adjust according to your actual data structure
				const userId = data.user.id;
				// Call your API route to handle the referral logic
				const response = await fetch('/api/referrals', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						referrerId: referrerId,
						referredId: userId,
					}),
				});

				if (!response.ok) {
					throw new Error('Failed to record referral');
				}

				// Clear the referrer ID from local storage
				localStorage.removeItem('isaac-referrer-id');
			}

			// Redirect user to Dashboard
			router.push(`/editor`);
		} catch (error) {
			toast.error(error.message);
			console.error('Error during sign up:', error);
		} finally {
			setIsLoading(false);
		}
	}

	async function signUpWithGoogle(e) {
		e.preventDefault();
		mixpanel.track('Sign Up', { provider: 'google' });

		const { error } = await loginWithGoogle();

		if (error) {
			alert('error signing in');
		}
	}

	useEffect(() => {
		// Redirect to /editor if user exists
		if (user) {
			router.push('/editor');
		}
	}, [router, user]);

	return (
		<>
			<Head>
				<title>Sign Up - Isaac</title>
			</Head>
			<AuthLayout
				title="Create your Isaac account"
				subtitle={
					<>
						Already registered?{' '}
						<Link
							href="/signin"
							className="underline underline-offset-4 hover:text-primary"
						>
							Sign in
						</Link>{' '}
						to your account.
					</>
				}
			>
				<div className={cn('grid gap-6')}>
					<form onSubmit={signUpWithEmail}>
						<div className="flex flex-col gap-4 min-w-[320px] md:min-w-[500px]">
							<div>
								<Label className="text-foreground" htmlFor="email">
									Email
								</Label>
								<LandingInput
									className=""
									id="email"
									placeholder="name@example.com"
									type="email"
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect="off"
									onChange={e => setEmail(e.target.value)}
									required
								/>
							</div>
							<div>
								<Label className="text-foreground" htmlFor="password">
									Password
								</Label>
								<LandingInput
									id="password"
									className="mb-1"
									placeholder="Choose a secure password"
									type="password"
									autoCapitalize="none"
									autoComplete="off"
									autoCorrect="off"
									onChange={e => setPassword(e.target.value)}
									required
								/>
								<Label className="text-foreground" htmlFor="repeatPassword">
									Repeat Password
								</Label>
								<LandingInput
									id="repeatPassword"
									placeholder="Repeat your password"
									type="password"
									autoCapitalize="none"
									autoComplete="off"
									autoCorrect="off"
								/>
							</div>
							<LandingButton
								type="submit"
								size="sm"
								disabled={isLoading}
								className="mt-4 w-full"
							>
								{isLoading && (
									<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
								)}
								Sign up with email
							</LandingButton>
						</div>
					</form>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background sm:bg-white px-2 text-[#747476]">
								Or continue with
							</span>
						</div>
					</div>
					<LandingButton
						variant="outline"
						size="sm"
						type="button"
						disabled={isLoading}
						onClick={signUpWithGoogle}
						className="bg-white"
					>
						<Icons.google className="mr-2 h-4 w-4" />
						Google
					</LandingButton>
					<div className="text-xs text-center text-muted-foreground">
						By signing up, you agree to receive emails from us.
					</div>
				</div>
			</AuthLayout>
		</>
	);
}
