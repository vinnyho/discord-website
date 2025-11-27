// Simple in-memory store for demo purposes
// In production, use a real database (PostgreSQL, MongoDB, etc.)

interface UserSubscription {
  discordId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due'
  createdAt: Date
}

// In-memory store (will reset on server restart)
const subscriptions = new Map<string, UserSubscription>()

export function saveSubscription(data: UserSubscription) {
  subscriptions.set(data.discordId, data)
  console.log('Saved subscription:', data)
}

export function getSubscriptionByDiscordId(discordId: string) {
  return subscriptions.get(discordId)
}

export function getSubscriptionByCustomerId(customerId: string) {
  for (const [, sub] of subscriptions) {
    if (sub.stripeCustomerId === customerId) {
      return sub
    }
  }
  return null
}

export function updateSubscriptionStatus(
  discordId: string,
  status: 'active' | 'canceled' | 'past_due'
) {
  const sub = subscriptions.get(discordId)
  if (sub) {
    sub.status = status
    subscriptions.set(discordId, sub)
  }
}
