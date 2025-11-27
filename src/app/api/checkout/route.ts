import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { auth } from '@/auth'

export async function POST() {
  try {
    const session = await auth()

    if (!session?.discordId || !session?.accessToken) {
      return NextResponse.json(
        { error: 'Please connect your Discord account first' },
        { status: 401 }
      )
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      metadata: {
        discordId: session.discordId,
        discordAccessToken: session.accessToken,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
