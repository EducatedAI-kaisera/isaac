import initStripe from 'stripe';
import getSupabaseServerClient from '../../server/util';

const handler = async (req, res) => {
	const accessToken = req.headers['x-access-token'];
	const refreshToken = req.headers['x-refresh-token'];

	const supabase = getSupabaseServerClient(req, res);
	const {
		data: { user },
	} = await supabase.auth.setSession({
		access_token: accessToken,
		refresh_token: refreshToken,
	});

	if (!user) {
		return res.status(401).send('Unauthorized');
	}

	const {
		data: { stripe_customer },
	} = await supabase
		.from('profile')
		.select('stripe_customer')
		.eq('id', user?.id)
		.single();

	const stripe = initStripe(process.env.STRIPE_SECRET_KEY);

	const session = await stripe.billingPortal.sessions.create({
		customer: stripe_customer,
	});

	res.send({
		url: session.url,
	});
};

export default handler;
