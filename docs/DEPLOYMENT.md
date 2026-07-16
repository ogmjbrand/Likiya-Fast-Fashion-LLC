# Deployment

Three Vercel projects, one Supabase project, one Resend domain, and
whichever payment providers you actually enable.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Link it locally and push the schema:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
3. **Enable OAuth providers** you intend to use (Google, Apple) under
   Authentication → Providers — the app requests them by name in
   `packages/auth/src/operations.ts`'s `getOAuthRedirectUrl`, so an
   unconfigured provider will fail at Supabase's end, not silently.
4. **Set the redirect URLs** for each deployed app's OAuth callback:
   `https://<storefront-domain>/auth/callback` (and the admin equivalent,
   if you add staff OAuth login there later).
5. Grab the project URL, anon key, and service role key from
   Settings → API — you'll need all three across the apps below.
6. Optional: run `supabase/seed/seed.sql` against the linked project if you
   want the sample product visible before you've loaded real catalog data.

## 2. Vercel projects

Create **three** Vercel projects from the same GitHub repo, each pointed at
a different app via its Root Directory setting:

| Vercel project | Root Directory | Suggested domain |
| --- | --- | --- |
| `likiya-storefront` | `apps/storefront` | `likiya.com` |
| `likiya-admin` | `apps/admin` | `admin.likiya.com` |
| `likiya-api` | `apps/api` | `api.likiya.com` |

Vercel auto-detects the Next.js build (`next build`) and respects each
app's own `package.json` scripts. Because this is a pnpm workspace, Vercel's
install step (`pnpm install`) run from any of the three projects installs
the whole workspace — that's expected and lets Turborepo's build cache work
across projects if you connect [Vercel Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching).

Set each project's environment variables per `docs/ENVIRONMENT.md` — note
that `NEXT_PUBLIC_SITE_URL` differs per app (it should be that app's own
deployed URL), while `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are the same
across all three (one Supabase project backs everything).

## 3. Payment provider webhooks

Point each provider's webhook at the **api** app, not the storefront:

- **Stripe**: Dashboard → Developers → Webhooks → add endpoint
  `https://api.likiya.com/webhooks/stripe`, subscribe to
  `checkout.session.completed` and `checkout.session.async_payment_failed`.
  Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
- **Paystack**: Dashboard → Settings → API Keys & Webhooks → set the
  webhook URL to `https://api.likiya.com/webhooks/paystack`. Paystack signs
  with your secret key directly (no separate webhook secret) —
  `PAYSTACK_SECRET_KEY` is used for both API calls and signature
  verification.
- **Flutterwave**: Dashboard → Settings → Webhooks → set the URL to
  `https://api.likiya.com/webhooks/flutterwave` and set a **Secret Hash**
  there; put that same value in `FLUTTERWAVE_WEBHOOK_SECRET`. Unlike the
  other two, this isn't an HMAC of the payload — it's a static string
  Flutterwave echoes back verbatim in the `verif-hash` header.

Only enable the providers you've actually configured — `apps/storefront`'s
checkout form always shows all three, and an unconfigured one fails
gracefully with a toast ("X is not configured yet") rather than a crash,
but there's no reason to show a payment method your business doesn't
support. Trim the `RadioGroup` in
`apps/storefront/src/app/(storefront)/(shop)/checkout/checkout-form.tsx` to
match.

## 4. Cron

`apps/api/vercel.json` declares one scheduled job (daily low-stock digest
email). Vercel Cron only works once the api project is deployed with a Pro
plan or above; on Hobby, trigger `GET /cron/low-stock-digest` from an
external scheduler instead (with the `Authorization: Bearer <CRON_SECRET>`
header), or delete the `crons` entry.

## 5. Resend (transactional email)

1. Verify your sending domain in the Resend dashboard.
2. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` on **both** the storefront
   (order confirmation emails are triggered from `apps/api`'s fulfillment
   path, but the storefront app doesn't send email directly today) and the
   api project — practically, only `apps/api` needs these since
   `fulfillOrderPayment()` lives there.
3. Until Resend is configured, `sendEmail()` no-ops with a console warning
   instead of throwing — checkout and fulfillment work fine without it,
   customers just won't get confirmation emails.

## 6. Post-deploy checklist

- [ ] Sign up a test account on the deployed storefront, then promote it
      to `admin` via the Supabase SQL editor and confirm you can reach
      the admin dashboard.
- [ ] Run a real test-mode purchase through each enabled payment provider
      and confirm the order shows up in the admin Orders list with status
      `processing` and a recorded payment.
- [ ] Confirm `GET https://api.likiya.com/health` returns `{"status":"ok"}`.
- [ ] Check `/sitemap.xml` and `/robots.txt` on the storefront domain.
