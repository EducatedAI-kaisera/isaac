import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	experimental: {
		scrollRestoration: true,
	},
	pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
	images: {
		domains: [
			'ueftdvxzwiswsoiqoqwf.supabase.co',
			'gzxyhflukmcbrfvltcgj.supabase.co',
		],
	},
};

export default withBundleAnalyzer(nextConfig)({
	enabled: process.env.ANALYZE === 'true',
})
