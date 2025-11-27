# Discord Premium Access - Stripe Payments

A Next.js application that allows users to pay for Discord server access via Stripe subscriptions. Automatically adds paying users to your Discord server with a premium role, and removes access when subscriptions end.

## Features

- Discord OAuth authentication
- Stripe recurring subscription payments
- Automatic Discord server/role management via bot
- Webhook handling for subscription lifecycle (new, canceled, payment failures)
- Modern UI with Tailwind CSS

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Stripe (Payments)
- NextAuth.js (Authentication)
- Discord.js (Bot)

## Prerequisites

- Node.js 18+
- npm
- Stripe account
- Discord account with a server you own/admin

---

## Setup Guide

### 1. Install Dependencies

```bash
npm install
```

### 2. Stripe Configuration

1. **Create Stripe Account**: https://dashboard.stripe.com/register

2. **Get API Keys**:
   - Go to https://dashboard.stripe.com/apikeys
   - Copy **Publishable key** (starts with `pk_test_`)
   - Copy **Secret key** (starts with `sk_test_`)

3. **Create a Product**:
   - Go to Products → Add Product
   - Name: "Premium Discord Access" (or your choice)
   - Pricing: $9.99/month (recurring)
   - Save and copy the **Price ID** (starts with `price_`)

4. **Set up Webhook** (for local testing):
   ```bash
   npm install -g stripe
   stripe login
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```
   Copy the webhook signing secret (starts with `whsec_`)

   For production, add webhook endpoint in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 3. Discord Application Setup

1. **Create Application**: https://discord.com/developers/applications
   - Click "New Application"
   - Name it (e.g., "Premium Access")

2. **Get OAuth2 Credentials**:
   - Go to OAuth2 → General
   - Copy **Client ID**
   - Copy **Client Secret**

3. **Add Redirect URL**:
   - Still in OAuth2 → General
   - Add redirect: `http://localhost:3001/api/auth/callback/discord`
   - For production: `https://yourdomain.com/api/auth/callback/discord`

4. **Create Bot**:
   - Go to Bot section
   - Click "Add Bot"
   - Copy the **Bot Token** (click "Reset Token" if needed)
   - Enable **Server Members Intent** under Privileged Gateway Intents

5. **Invite Bot to Your Server**:
   - Go to OAuth2 → URL Generator
   - Scopes: `bot`
   - Bot Permissions: `Manage Roles`
   - Copy the generated URL and open it in browser
   - Select your server and authorize

### 4. Discord Server Configuration

1. **Enable Developer Mode**:
   - User Settings → Advanced → Developer Mode (ON)

2. **Get Guild (Server) ID**:
   - Right-click your server name
   - Click "Copy Server ID"

3. **Create Premium Role**:
   - Server Settings → Roles → Create Role
   - Name it (e.g., "Premium Member")
   - Set permissions as desired
   - **Important**: Make sure the bot's role is ABOVE this role in the hierarchy

4. **Get Role ID**:
   - Right-click the premium role
   - Click "Copy Role ID"

### 5. Generate Auth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

### 6. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all values:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Discord Bot
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_server_id
DISCORD_ROLE_ID=your_premium_role_id

# NextAuth
AUTH_SECRET=your_generated_secret
AUTH_URL=http://localhost:3001
```

---

## Running the Application

### Development

```bash
npm run dev
```

Open http://localhost:3001

### Production Build

```bash
npm run build
npm start
```

---

## How It Works

1. **User visits site** → Sees pricing page
2. **Clicks "Connect Discord & Subscribe"** → Redirects to Discord OAuth
3. **Authenticates with Discord** → Returns to site with session
4. **Clicks "Subscribe Now"** → Redirects to Stripe Checkout
5. **Completes payment** → Stripe sends webhook
6. **Webhook received** → Bot adds user to Discord server with premium role
7. **Subscription cancels** → Webhook fires → Bot removes premium role

---

## Project Structure

```
discord-payments/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/    # NextAuth endpoints
│   │   │   ├── checkout/              # Stripe checkout session creation
│   │   │   └── webhooks/stripe/       # Stripe webhook handler
│   │   ├── success/                   # Payment success page
│   │   ├── globals.css                # Global styles
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Landing page
│   │   └── providers.tsx              # Session provider
│   ├── lib/
│   │   ├── db.ts                      # Data storage (in-memory demo)
│   │   ├── discord.ts                 # Discord bot utilities
│   │   └── stripe.ts                  # Stripe client
│   ├── types/
│   │   └── next-auth.d.ts             # NextAuth type extensions
│   └── auth.ts                        # NextAuth configuration
├── .env.local                         # Environment variables (create this)
├── .env.example                       # Example environment file
└── package.json
```

---

## Important Notes

### Security
- Never commit `.env.local` to version control
- Store Discord access tokens securely (currently in Stripe metadata)
- Use HTTPS in production

### Database
The current implementation uses an in-memory store (`src/lib/db.ts`). For production:
- Replace with a real database (PostgreSQL, MongoDB, etc.)
- Store user subscriptions persistently
- Add proper error handling and retry logic

### Discord Access Token
The OAuth access token is passed through Stripe metadata. This works but:
- Tokens expire (typically 7 days)
- For production, consider refreshing tokens or using a different approach

### Bot Permissions
Ensure your bot's role is positioned **above** the premium role in Discord's role hierarchy, otherwise it cannot assign that role.

---

## Testing

### Test Payment Flow
1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any CVC
4. Any billing details

### Test Webhook Events
With Stripe CLI running:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Update URLs:
   - `NEXT_PUBLIC_BASE_URL` → your Vercel URL
   - `AUTH_URL` → your Vercel URL
5. Update Discord redirect URL in Discord Developer Portal
6. Add production webhook URL in Stripe Dashboard

### Other Platforms
- Railway
- Render
- DigitalOcean App Platform
- AWS/GCP/Azure

---

## Common Issues

### "Invalid signature" on webhook
- Make sure `STRIPE_WEBHOOK_SECRET` is correct
- For local: use the secret from `stripe listen` command

### Bot can't add role
- Check bot role hierarchy (must be above target role)
- Verify `DISCORD_ROLE_ID` is correct
- Ensure bot has "Manage Roles" permission

### OAuth redirect error
- Verify redirect URL matches exactly in Discord Developer Portal
- Check `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`

### User not added to server
- Ensure `guilds.join` scope is in OAuth configuration
- Bot must be in the server already
- User must authorize the app

---

## Future Improvements

- [ ] Add real database (PostgreSQL/MongoDB)
- [ ] Email notifications
- [ ] Customer portal for subscription management
- [ ] Multiple pricing tiers
- [ ] Admin dashboard
- [ ] Proper logging and monitoring
- [ ] Rate limiting
- [ ] Token refresh mechanism

---

## License

MIT

---

## Support

For issues with:
- **Stripe**: https://stripe.com/docs
- **Discord API**: https://discord.com/developers/docs
- **NextAuth**: https://authjs.dev
- **Next.js**: https://nextjs.org/docs
