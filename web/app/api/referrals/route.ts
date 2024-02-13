import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'


export async function POST(req: Request) {

	const getBody = await req.json()

	const cookieStore = cookies();
	const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

	const { error } = await supabase
  .from('referrals')
  .insert({ referred_id: getBody.referredId, referral_id: getBody.referrerId });

	if (error) {
		console.log(error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}

	return NextResponse.json({ message: 'Referral successfully created' })

}
