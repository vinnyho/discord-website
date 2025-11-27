import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { addUserToGuild, removeRoleFromUser } from '@/lib/discord'
import { saveSubscription, getSubscriptionByCustomerId, updateSubscriptionStatus } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.metadata) {
          const { discordId, discordAccessToken } = session.metadata

          if (discordId && discordAccessToken) {
            // Add user to Discord server with premium role
            await addUserToGuild(discordId, discordAccessToken)

            // Save subscription info
            saveSubscription({
              discordId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
              createdAt: new Date(),
            })

            console.log(`Successfully added Discord user ${discordId} to server`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const userSub = getSubscriptionByCustomerId(customerId)

        if (userSub) {
          if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
            // Optionally remove role for past due payments
            await removeRoleFromUser(userSub.discordId)
            updateSubscriptionStatus(userSub.discordId, 'past_due')
            console.log(`Removed role from user ${userSub.discordId} due to payment issue`)
          } else if (subscription.status === 'active') {
            updateSubscriptionStatus(userSub.discordId, 'active')
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const userSub = getSubscriptionByCustomerId(customerId)

        if (userSub) {
          // Remove premium role from user
          await removeRoleFromUser(userSub.discordId)
          updateSubscriptionStatus(userSub.discordId, 'canceled')
          console.log(`Removed premium role from user ${userSub.discordId}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
