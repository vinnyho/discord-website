# Quick Setup Guide

## First Time Setup

### 1. Install Stripe CLI (one-time)
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://github.com/stripe/stripe-cli/releases
```

### 2. Login to Stripe (one-time)
```bash
stripe login
```
Follow the prompts to authenticate.

### 3. Get Webhook Secret
When you run the app for the first time, look for this line in the terminal:
```
Ready! Your webhook signing secret is whsec_xxxxx
```
Copy that secret.

---

## Running the App

### Option 1: Everything Together (Recommended)
```bash
npm run dev:all
```
This runs both Next.js and Stripe webhook listener together.

**First time?** Copy the webhook secret (whsec_...) from the terminal and add it to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### Option 2: Separate Terminals
Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run stripe:listen
```

---

## Testing

1. Open http://localhost:3000
2. Click "Connect Discord & Subscribe"
3. Login with Discord
4. Use test card: `4242 4242 4242 4242`
5. Complete payment
6. Check your Discord server - you should have the premium role!

---

## Troubleshooting

**"stripe: command not found"**
- Install Stripe CLI (see step 1 above)

**"You need to login first"**
- Run `stripe login`

**Payment works but not added to Discord**
- Make sure webhook secret is in `.env.local`
- Check terminal for webhook events

**Port issues**
- Make sure no other apps are using port 3000
- Update Discord redirect URL to match the port shown in terminal
