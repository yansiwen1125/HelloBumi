# HelloBumi

Marketing site and early-interest signup for **Bumi**, an AI companion designed to help children pause, reflect, and build healthier screen-time habits.

The site presents the product story, app and robot concepts, product video, FAQs, and a waitlist form. It is a lightweight static site with one Vercel Serverless endpoint for collecting signups.

## What’s included

- Responsive, accessible landing page for desktop and mobile
- Product demo video with inline preview and full-screen playback
- Waitlist form with client-side validation and a honeypot field
- Supabase-backed waitlist storage through a server-only Vercel function
- Google Analytics 4 events for CTAs, form interactions, sections, and video engagement

## Project structure

```text
.
├── index.html           # Page structure and GA4 tag
├── styles.css           # Responsive visual system and layout
├── assets/              # Images, illustrations, favicon, and product video
├── cta-form.js          # Waitlist form state and submission handling
├── form-config.js       # Browser-side endpoint configuration
├── video-showcase.js    # Inline preview and modal video controls
├── analytics-events.js  # GA4 interaction and video events
├── api/submit.js        # Vercel Serverless waitlist endpoint
├── waitlist.sql         # Supabase table setup
└── .env.example         # Required local environment variables
```

## Run locally

The landing page itself has no build step. Any static file server can preview the visual experience:

```bash
npx serve .
```

Open the URL printed by the command. The waitlist form requires the serverless API, so use Vercel’s local runtime when testing the full flow:

```bash
cp .env.example .env.local
npx vercel dev
```

Add the Supabase values to `.env.local` before submitting the form. Never commit this file or a service-role key.

## Configure the waitlist

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [waitlist.sql](./waitlist.sql).
3. Copy `.env.example` to `.env.local` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. Run `npx vercel dev`, open the local site, and submit a test email.
5. For production, add the same variables in the Vercel project’s environment settings and deploy.

The endpoint accepts `POST /api/submit` with an `email` value. It validates email format, silently accepts honeypot submissions, and treats duplicate addresses as a successful registration so the form does not reveal existing records.

## Analytics

The GA4 measurement ID is configured directly in [index.html](./index.html). Interaction events are defined in [analytics-events.js](./analytics-events.js), including:

- CTA clicks and waitlist form view, focus, submit, success, and error states
- Time spent viewing key sections
- Video preview clicks, playback, progress checkpoints, and completion

Before using a different GA4 property, replace the measurement ID in `index.html` and verify the event names in GA4 DebugView.

## Deployment

Deploy this repository to Vercel. Vercel serves `index.html` as the site and exposes `api/submit.js` as `/api/submit`; the browser is already configured to post to that path.

```bash
npx vercel
```

Set the Supabase environment variables in the Vercel dashboard before promoting a deployment to production.

## Tech stack

- HTML, CSS, and vanilla JavaScript
- Vercel Serverless Functions
- Supabase PostgREST
- Google Analytics 4

## Repository hygiene

Local environment files and Vercel metadata are excluded through `.gitignore`. Keep product assets in `assets/`, and do not add secrets, exported database data, or individual waitlist records to the repository.
