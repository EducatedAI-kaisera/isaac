import { useUser } from '@context/user';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useId } from 'react';
import Meteors from '@components/ui/meteors'

import { Container } from '@components/landing/Container';
import { LandingButton } from '@components/ui/button-landing';

import logoHarvard from '@components/images/logos/harvard.svg';
import logoMichigan from '@components/images/logos/michigan.svg';
import logoStanford from '@components/images/logos/stanford.svg';
import logoYale from '@components/images/logos/yale.svg';

import logoMIT from '@components/images/logos/mit.svg';
import logoRWTH from '@components/images/logos/rwth.svg';

import TypedText from './TypedText'

function BackgroundIllustration(props) {
	let id = useId();

	return (
		<div {...props}>
			<svg
				viewBox="0 0 1026 1026"
				fill="none"
				aria-hidden="true"
				className="absolute inset-0 h-full w-full animate-spin-slow"
			>
				<path
					d="M1025 513c0 282.77-229.23 512-512 512S1 795.77 1 513 230.23 1 513 1s512 229.23 512 512Z"
					stroke="#D4D4D4"
					strokeOpacity="0.7"
				/>
				<path
					d="M513 1025C230.23 1025 1 795.77 1 513"
					stroke={`url(#${id}-gradient-1)`}
					strokeLinecap="round"
				/>
				<defs>
					<linearGradient
						id={`${id}-gradient-1`}
						x1="1"
						y1="513"
						x2="1"
						y2="1025"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#0f172a" />
						<stop offset="1" stopColor="#0f172a" stopOpacity="0" />
					</linearGradient>
				</defs>
			</svg>
			<svg
				viewBox="0 0 1026 1026"
				fill="none"
				aria-hidden="true"
				className="absolute inset-0 h-full w-full animate-spin-reverse-slower"
			>
				<path
					d="M913 513c0 220.914-179.086 400-400 400S113 733.914 113 513s179.086-400 400-400 400 179.086 400 400Z"
					stroke="#D4D4D4"
					strokeOpacity="0.7"
				/>
				<path
					d="M913 513c0 220.914-179.086 400-400 400"
					stroke={`url(#${id}-gradient-2)`}
					strokeLinecap="round"
				/>
				<defs>
					<linearGradient
						id={`${id}-gradient-2`}
						x1="913"
						y1="513"
						x2="913"
						y2="913"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#0f172a" />
						<stop offset="1" stopColor="#0f172a" stopOpacity="0" />
					</linearGradient>
				</defs>
			</svg>
		</div>
	);
}

export function Hero() {
	// let video = useRef();
	const { user } = useUser();

	// useEffect(() => {
	// 	video.current.playbackRate = 1.5;
	// }, []);
	return (
		<div className="overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36">
			<Container>
			<div className="flex flex-col items-center justify-center">
			<div className="text-center max-w-2xl">

						<h1 className="text-5xl font-bold tracking-tight text-gray-900">
							{/* The AI-powered workspace for <br/><TypedText /> */}
							Research, write, edit. <br/>
							With AI at your side.
						</h1>


						<p className="mt-4 text-2xl text-gray-600">
						The AI-powered workspace for <TypedText />
						</p>

						<div className="mt-8 flex flex-wrap gap-x-6 gap-y-4 justify-center">
							{user ? (
								<LandingButton asChild>
									<Link href="/editor">Go to editor</Link>
								</LandingButton>
							) : (
								<div className="flex flex-col ">
									<LandingButton asChild>
										<Link href="/signup">Start writing for free</Link>
									</LandingButton>
									<span className="text-sm mt-2 ml-0.5 text-muted-foreground">
										Free forever. No credit card required. ❤️
									</span>
								</div>
							)}
						</div>
					</div>

					<div className="relative mt-8 sm:mt-20 lg:col-span-5 lg:row-span-2 lg:mt-0 xl:col-span-6">
						<BackgroundIllustration className="absolute left-1/2 top-4 h-[1026px] w-[1026px] -translate-x-1/3 stroke-gray-300/70 [mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)] sm:top-16 sm:-translate-x-1/2 lg:-top-16 lg:ml-12 xl:-top-14 xl:ml-0" />
						{/* <div className="-mx-4 flex items-center justify-center h-[448px] px-9 [mask-image:linear-gradient(to_bottom,white_60%,transparent)] sm:mx-0 lg:absolute lg:-inset-x-10 lg:-bottom-20 lg:-top-10 lg:h-auto lg:px-0 lg:pt-10 xl:-bottom-32">
							<div className="max-w-[700px] md:ml-12">
								<video
									ref={video}
									autoPlay
									muted
									loop
									className="rounded-md shadow-lg"
								>
									<source src="/landing-video-isaac.mp4" />
								</video>
							</div>
						</div> */}
					</div>

					<div className="mt-8 text-center">
                <p className="text-sm font-semibold text-gray-900">
                    Join more than +23,735 researchers & students
                </p>
						<ul
							role="list"
							className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-x-10 gap-y-8"						>
							{[
								['Harvard', logoHarvard],
								['Stanford', logoStanford],
								['Yale', logoYale],
								['Michigan', logoMichigan, 'hidden xl:block'],
								['MIT', logoMIT],
								['RWTH', logoRWTH],
								// ['Cornell', logoCornell],
								// ['HuffPost', logoHuffpost, 'hidden xl:block'],
							].map(([name, logo, className]) => (
								<li key={name} className={clsx('flex', className)}>
									<Image
										src={logo}
										alt={name}
										className="h-8 max-w-min filter grayscale"
										unoptimized
									/>
								</li>
							))}
						</ul>
					</div>
				</div>
			</Container>
		</div>
	);
}
