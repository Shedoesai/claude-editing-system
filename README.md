# The Claude Editing System: waitlist site

Static page (`index.html`, `thanks.html`, `media/`) plus one Vercel function (`api/subscribe.js`).
The form on the page posts to `/api/subscribe`, which adds the person to beehiiv with the tag
`course-waitlist`, then the visitor lands on `/thanks?n=<first name>`.

## Environment variables (Vercel → Settings → Environment Variables)
- `BEEHIIV_API_KEY`: from beehiiv Settings → API
- `BEEHIIV_PUBLICATION_ID`: starts with `pub_`
- `BEEHIIV_TAG` (optional, default `course-waitlist`)
- `BEEHIIV_NAME_FIELD` (optional): exact name of a beehiiv custom field for first name

If the function fails, the page links to the hosted beehiiv form as a fallback.
