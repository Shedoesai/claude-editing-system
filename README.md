# The Claude Editing System: waitlist site

Static page (`editing/index.html`, `editing/thanks.html`, `media/`) plus Vercel functions in `api/`.
All email-tool calls live in `lib/email-list.js`, so switching from beehiiv to another tool means changing only that file.
The form on the page posts to `/api/subscribe`, which adds the person to beehiiv with the tag
`course-waitlist`, then the visitor lands on `/thanks?n=<first name>`.

## Environment variables (Vercel → Settings → Environment Variables)
- `BEEHIIV_API_KEY`: from beehiiv Settings → API
- `BEEHIIV_PUBLICATION_ID`: starts with `pub_`
- `BEEHIIV_TAG` (optional, default `course-waitlist`)
- `BEEHIIV_NAME_FIELD` (optional): exact name of a beehiiv custom field for first name

## Purchases (Lemon Squeezy)
`api/purchase.js` receives Lemon Squeezy's `order_created` webhook and tags the buyer `course-buyer`.
Sales emails go to the beehiiv segment "tag course-waitlist AND NOT tag course-buyer".
- `LEMONSQUEEZY_WEBHOOK_SECRET`: the signing secret set on the webhook in Lemon Squeezy
- `BUYER_TAG` (optional, default `course-buyer`)
- Webhook URL: `https://www.shedoesai.com/api/purchase`, event `order_created`

If the function fails, the page links to the hosted beehiiv form as a fallback.
