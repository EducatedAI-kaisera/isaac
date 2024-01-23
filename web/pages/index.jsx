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
	return (
		<>
			<Head>
				<title>Isaac Editor - AI-first Text Editor For Academic Writing</title>
				<meta
					property="og:title"
					content="Isaac Editor - AI-first Text Editor For Academic Writing"
					key="title"
				/>
				{/* TODO: Need to Put more description here
            Please follow the guidelines
            https://developer.chrome.com/docs/lighthouse/seo/meta-description/?utm_source=lighthouse&utm_medium=lr#meta-description-best-practices
        */}
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
