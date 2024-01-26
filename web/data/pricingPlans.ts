export const freePlanLimits = {
	dailyFreeToken: 20,
	uploadStorage: 100,
};


const monthlyId =
	process.env.NODE_ENV === 'development'
		? 'price_1NPj0LK2peOePDsbxRe4OJAw'
		: 'price_1OcwmXK2peOePDsbgNvAdhB7';

const yearlyId =
	process.env.NODE_ENV === 'development'
		? 'price_1NPj0LK2peOePDsbxRe4OJAw'
		: 'price_1OcwnkK2peOePDsbCJMSqqTK';

export const pricingPlans = [
	{
		name: 'Free forever',
		featured: false,
		price: '$0',
		priceId: undefined,
		description: 'No subscription required',
		features: [
			`${freePlanLimits.dailyFreeToken} daily tokens generative AI & chat`,
			`${freePlanLimits.uploadStorage} MB of file upload storage`,
			'AI-assisted writing',
			`Upload and chat with your documents`,
			'Literature Search',
			'Community Support',
		],
		logomarkClassName: 'fill-primary',
	},
	{
		name: 'Monthly',
		featured: false,
		priceId: monthlyId,
		oldPrice: '$30/mo ',
		price: '$20/mo',
		description: 'Monthly Subscription',
		features: [
			'Unlimited generative AI & Chat',
			'Unlimited file upload storage',
			'AI-assisted writing',
			'Upload and chat with your documents',
			'Literature Search',
			'Premium Support',
		],
		logomarkClassName: 'fill-primary',
	},
	{
		name: 'Yearly',
		featured: false,
		priceId: yearlyId,
		oldPrice: '$25/mo',
		price: '$16.66/mo',
		description: 'Yearly Subscription',
		features: [
			'Unlimited generative AI & Chat',
			'Unlimited file upload storage',
			'AI-assisted writing',
			'Upload and chat with your documents',
			'Literature Search',
			'Premium Support',
		],
		logomarkClassName: 'fill-primary',
	},
];
