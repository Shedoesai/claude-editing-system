# The Claude Editing System: waitlist, checkout and course site

Static page (`editing/index.html`, `editing/thanks.html`, `media/`) plus Vercel functions in `api/`.
All email-tool calls live in `lib/email-list.js`, so switching from beehiiv to another tool means changing only that file.
The form on the page posts to `/api/subscribe`, which adds the person to beehiiv with the tag
`course-waitlist`, then the visitor lands on `/thanks?n=<first name>`.

## Environment variables (Vercel → Settings → Environment Variables)
- `BEEHIIV_API_KEY`: from beehiiv Settings → API
- `BEEHIIV_PUBLICATION_ID`: starts with `pub_`
- `BEEHIIV_TAG` (optional, default `course-waitlist`)
- `BEEHIIV_NAME_FIELD` (optional): exact name of a beehiiv custom field for first name

## Purchases (Stripe or Lemon Squeezy)
`api/purchase.js` receives Stripe's `checkout.session.completed` or Lemon Squeezy's `order_created` webhook and tags the buyer `course-buyer`.
Sales emails go to the beehiiv segment "tag course-waitlist AND NOT tag course-buyer".
- `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`) or `LEMONSQUEEZY_WEBHOOK_SECRET`, for whichever provider is used
- `BUYER_TAG` (optional, default `course-buyer`)
- Webhook URL for either: `https://www.shedoesai.com/api/purchase`

If the function fails, the page links to the hosted beehiiv form as a fallback.

## Course area (students)
No passwords. Access is checked directly with Stripe, so it works even if a webhook is late.
- After paying, Stripe sends the buyer to `/api/start?session_id=...`, which confirms the payment and logs them straight in.
- The Stripe webhook (`api/purchase.js`) also sends one welcome email with a 7-day login link (marked on the payment in Stripe, so retries don't resend it).
- Later visits: `/editing/login` → type email → a login link valid for 15 minutes (only sent if that email has paid; refunded payments don't count).
- Logged in = a signed cookie for 30 days. The course page `/editing/course` is rendered by `api/course.js` from `course/content.js`.
- Videos play from Bunny Stream with signed embed links; the student pack downloads through `api/download.js` with short-lived signed Bunny CDN links.
- Progress ("Mark as done") is saved in the student's browser.

Edit lessons and files in `course/content.js` (paste each Bunny video id into `video`).

Environment variables:
- `AUTH_SECRET`: a long random string (64+ characters). Changing it logs everyone out.
- `STRIPE_SECRET_KEY`: a restricted key with Checkout Sessions read and PaymentIntents write is enough
- `STRIPE_PAYMENT_LINK_ID` (optional, `plink_...`): only purchases through this Payment Link give access
- `ACCESS_EMAILS` (optional): comma-separated emails with free access (yourself, helpers, gifts)
- `RESEND_API_KEY`, `MAIL_FROM` (e.g. `Gunhild from shedoesai <course@shedoesai.com>`, domain verified in Resend)
- `SUPPORT_EMAIL` (optional): reply-to for course emails, shown on the course page
- `BUNNY_LIBRARY_ID`, `BUNNY_STREAM_TOKEN_KEY`: Bunny Stream library id and its embed token key
- `BUNNY_FILES_HOST`, `BUNNY_FILES_TOKEN_KEY`: pull zone in front of the storage zone with the student pack, and its token key
- `SITE_URL` (optional, default from the request): `https://www.shedoesai.com`

Stripe Payment Link → After payment → "Don't show confirmation page" → redirect to
`https://www.shedoesai.com/api/start?session_id={CHECKOUT_SESSION_ID}`.
