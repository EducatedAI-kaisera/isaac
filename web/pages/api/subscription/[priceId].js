import initStripe from 'stripe';
import getSupabaseServerClient from '../../../server/util';

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
		data
	} = await supabase
		.from('profile')
		.select('stripe_customer')
		.eq('id', req.query.userId)
		.single();

	const stripe = initStripe(process.env.STRIPE_SECRET_KEY);
	const { priceId } = req.query;

	const lineItems = [
		{
			price: priceId,
			quantity: 1,
		},
	];

	const session = await stripe.checkout.sessions.create({
		customer: data.stripe_customer,
		mode: req.query.mode,
		payment_method_types: ['card', 'us_bank_account', 'sepa_debit'],
		line_items: lineItems,
		success_url: 'https://isaaceditor.com/success',
		cancel_url: 'https://isaaceditor.com/cancelled',
		allow_promotion_codes: true,
	});

	res.send({
		id: session.id,
	});
};

export default handler;
