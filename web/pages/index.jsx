import Head from 'next/head';

import { CallToAction } from '@components/landing/CallToAction';
import { Faqs } from '@components/landing/Faqs';
import { Footer } from '@components/landing/Footer';
import { Header } from '@components/landing/Header';
import { Hero } from '@components/landing/Hero2';
import { Pricing } from '@components/landing/Pricing';
import { Reviews } from '@components/landing/Reviews';
import { SecondaryFeatures } from '@components/landing/SecondaryFeatures';
import { supabase } from '@utils/supabase';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export async function getStaticProps() {
	const { error, count } = await supabase
		.from('profile')
		.select('id', { count: 'exact', head: true });

	if (error) {
		console.error('Error fetching user count:', error);
		return { props: { userCount: 0 } };
	}

	return { props: { userCount: count } };
}

export default function Home({ userCount }) {
	const searchParams = useSearchParams();

	useEffect(() => {
		const referrerlId = searchParams.get('ref');
		if (referrerlId) {
			localStorage.setItem('isaac-referrer-id', referrerlId);
		}
	});

	return (
		<>
			<Head>
				<title>Isaac Editor - AI-first Text Editor For Academic Writing</title>
				<meta
					property="og:title"
					content="Isaac Editor - AI-first Text Editor For Academic Writing"
					key="title"
				/>

				<meta
					name="description"
					content="Isaac Editor - AI-first Text Editor For Academic Writing"
				/>
			</Head>
			<Header />
			<main className="bg-gray-50">
				<Hero userCount={userCount} />
				<SecondaryFeatures />
				<CallToAction />
				<Reviews />
				<Pricing />
				<Faqs />
			</main>
			<Footer />
		</>
	);
}
