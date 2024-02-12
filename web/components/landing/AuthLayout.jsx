import Link from 'next/link';

import { Logo } from '@components/landing/Logo';

export function AuthLayout({ title, subtitle, children }) {
	return (
		<main className="flex py-4 sm:py-28 bg-gray-50 items-center justify-center h-screen">
			<div className="mx-auto flex items-center w-full max-w-2xl min-w-2xl flex-col px-4 sm:px-6">
				<Link href="/" aria-label="Home">
					<Logo className="h-10 max-w-min" />
				</Link>
				<div></div>
				<div className="relative mt-8 sm:mt-16">
					<h1 className="text-center text-2xl font-medium tracking-tight text-gray-900">
						{title}
					</h1>
					{subtitle && (
						<p className="mt-3 text-center text-lg text-gray-600">{subtitle}</p>
					)}
				</div>
				<div className="-mx-4 mt-10 flex-auto sm:bg-white px-4 sm:shadow-lg shadow-gray-900/10 sm:mx-0 sm:flex-none sm:rounded-lg sm:p-24">
					{children}
				</div>
			</div>
		</main>
	);
}
