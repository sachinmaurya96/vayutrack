# VayuTrack V2 — website

The next version of the VayuTrack website: an interactive homepage built around a miniature logistics world (“Every shipment. A connected journey.”) plus every page of the current site, redesigned.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · three.js r182 via React Three Fiber 9 and Drei 10 · Motion 14.

## Run it

Requires Node.js 20.9+ (verified on Node 24).

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build        # type-checks and prerenders every page as static HTML
npm start            # serves the build on http://localhost:3000
```

Quality checks:

```bash
npx tsc --noEmit
npm run lint
```

Nothing is deployed automatically.

### QA switches

| URL | Effect |
| --- | --- |
| `/?scene=fallback` | Forces the SVG illustration (no WebGL download) |
| `/?scene=3d` | Forces WebGL even on small screens or software GPUs |

The operating system's reduced-motion setting is respected automatically.

## Pages

| Route | Page |
| --- | --- |
| `/` | Home: interactive 3D hero, tracking, service explorer, scroll-linked journey, story, use cases, FAQ |
| `/about` | About us: who we are, what we focus on, leadership |
| `/services` | All services with a comparison table |
| `/services/express-freight`, `/air-freight`, `/ocean-freight` | Service pages; the hero shows the live 3D world framed on that service |
| `/track` | Track a shipment, status explainer, tracking FAQ |
| `/ship-with-vayutrack` | Booking: 4 steps + review (`?service=air` pre-selects a service) |
| `/business-enquiry` | Business enquiry form |
| `/become-a-partner` | Partner enquiry form |
| `/contact` | Contact details and message form |
| `/locate-us` | Location search (honest “not connected” result) and head office |
| `/apply-jobs` | Careers with keyword, location and job-type filters |
| `/jobs/[slug]` | Six role pages with an application form |
| `/life` | Life at VayuTrack: culture, values, programmes, growth |
| `/blog`, `/blog/[slug]` | Blog index and three articles |
| any unknown URL | Designed 404 page |

Every link stays inside this site. The only outbound actions are the company phone number and email (`tel:` / `mailto:`).

## How the site is put together

```
src/
  app/                    routes; root layout holds the header, footer and the 3D scene host
  content/                ALL copy, URLs, contact facts, services, company, careers, blog, form fields
  lib/tracking/           validation, the DEMO-VT-001 fixture, the tracking adapter
  lib/forms/submit.ts     form submission adapter (backend-ready, honest when not configured)
  components/
    layout/               header (menus + mobile dialog, active page), footer
    sections/             homepage sections (some reused on inner pages)
    pages/                inner-page pieces: booking form, careers filter, locate search, service scene
    forms/SchemaForm.tsx  one accessible form engine for all six forms
    ui/                   page hero, breadcrumbs, links, logo, shipment timeline
    scene/
      store.ts            shared scene state: service mode, selected object, journey stage,
                          camera preset, pause / reduced motion, active view
      layout.ts           world layout, routes and camera framings (shared by 3D and SVG)
      poses.ts            pure vehicle/parcel poses from (view, state, clock)
      SceneHost.tsx       owns the single WebGL canvas and moves it between slots
      SceneSlot.tsx       a place the canvas can occupy (hero, services, journey)
      canvas/             React Three Fiber world: models, camera rig, frame driver
      fallback/           isometric SVG renderer for loading / no-WebGL / mobile / vignettes
```

**One canvas.** The home hero, service explorer, journey and the service-page heroes are “slots”. A single WebGL canvas lives in whichever slot is most visible, and follows you between pages. three.js is only downloaded on pages that have a slot. Before it leaves a slot it captures a still frame, so the slot keeps showing the same composition; slots it has not visited yet get a pre-rendered still as they scroll into view.

**One world.** Hub, sender's home, destination, airport and port share one coordinate system. Choosing Air or Ocean flies the camera across the same world.

**Rendering budget.** The page HTML renders before any 3D code loads. three.js loads lazily after the page is idle and only on viewports 768px and wider with a capable GPU. Rendering is on demand: it stops when no scene is on screen, when the tab is hidden, or when motion is paused. Ambient motion renders at about 30fps; camera transitions run at full rate. Pixel ratio is capped at 1.75, and repeated props (trees, parcels, containers, road marks) are instanced.

**Fallbacks.** The designed SVG illustration is used while 3D loads, on phones, without WebGL, on low-power devices (≤2 cores or ≤2 GB memory, Save-Data, software renderers), after a WebGL error, and after context loss. Selection, service tabs and journey stages drive it the same way.

## Editing content

All customer-facing text and destinations are in `src/content/`:

- `site.ts` — routes, contact details, navigation, footer groups
- `home.ts` — homepage copy
- `services.ts` — service summaries, detail pages and the comparison table
- `company.ts` — About and Life at VayuTrack
- `careers.ts` — open roles · `blog.ts` — articles · `forms.ts` — every form's fields and options
- `journey.ts`, `sceneObjects.ts`, `faq.ts`

Content for the inner pages comes from the current vayutrack.com pages (25 Nov 2026), tidied up. Coverage claims, “guaranteed”/“24/7” promises and unattributed staff quotes were left out.

No statistics, testimonials, client logos, guarantees or coverage claims are included.

## Tracking

Real tracking and the demo are kept separate.

- **Default (no API configured):** the widget validates the number locally and says plainly that live tracking isn’t connected yet, offering the sample journey or the contact section. It does not pretend a lookup happened and never sends the visitor to another site.
- **“Try the sample journey”:** shows the fixed `DEMO-VT-001` fixture, always labelled “Illustrative demo — not a live shipment.” A typed number never produces sample events; typing `DEMO-VT-001` into the real field points the visitor to the sample action instead.
- **When an approved API exists:** set `NEXT_PUBLIC_TRACKING_API_URL` to a URL template containing `{awb}` (for example `https://api.example.com/v1/shipments/{awb}`), then adapt `normalizeTrackingResponse` in `src/lib/tracking/adapter.ts` to the documented response. The widget already handles empty, invalid, loading, not-found (HTTP 404), network-error, server-error and success states. The current response mapping is a placeholder contract.

## Forms

Booking, business enquiry, partner, contact and job application forms share one engine: labelled fields, inline errors, an error summary that receives focus, multi-step progress with a review step (booking), and submission states.

- **Default (no backend):** after validation the form says “ready to send — nothing has been sent” and offers **Email these details** (opens an email with every answer filled in) or **Call the desk**. It never claims a message was sent.
- **With a backend:** set `NEXT_PUBLIC_FORMS_ENDPOINT`. Forms POST `{ form, values }` as JSON and only show “sent” when the endpoint returns 2xx; errors offer a retry and the email route. Adapt `src/lib/forms/submit.ts` to the real API.

## Verification (25 Nov 2026)

Run against `next build` + `next start` in Chrome (Playwright, hardware WebGL via Apple M4/Metal), plus `next dev` for iteration.

| Check | Result |
| --- | --- |
| Production build, `tsc --noEmit`, ESLint | Pass, no errors |
| Console errors / warnings | None in default, reduced-motion, no-WebGL and mobile runs |
| Layout at 1440×900, 1280×800, 1024×768, 768×1024, 390×844 | Reviewed by screenshot; no horizontal overflow on any route at 390 or 768, or on the homepage from 320 to 1440 |
| Headline / tracking / scene order on mobile | Headline, actions and tracking come before the scene |
| One `h1`, landmarks, labelled form, linked error message | Pass |
| Keyboard: skip link, Services menu (Enter/Escape, focus return), service tabs (arrow keys), FAQ (Enter/Space), mobile menu (focus trap, Escape, focus return) | Pass; focus ring visible |
| Scene ↔ HTML sync | Object buttons and clicking objects in the canvas select the same item; Reset View returns to the overview |
| Pause Motion | Canvas pixels stop changing while paused |
| Reduced motion | No ambient motion; camera changes snap; control reads “Motion reduced” |
| Offscreen / hidden tab | 0 WebGL draw calls when no scene is visible or the tab is hidden |
| No WebGL (`--disable-webgl`) | No canvas, no three.js download; SVG world works with all controls |
| WebGL context loss | Canvas removed, SVG illustration shown |
| Tracking | Empty, invalid, sample-ID, valid-number (“not connected”) and sample journey verified; API states verified against a mocked endpoint |
| Pages | All 30 routes prerender; each has one `h1` and its own title; unknown URLs return a real 404 |
| Links | Crawl of 24 linked pages: no broken links, no missing anchors, no links to other websites |
| Forms | Booking: `?service=` pre-select, per-step validation, focused error summary, review, honest result. Contact validation, careers filters, locate search verified |
| Navigation | Single canvas moves home → service pages → back without errors; parks invisibly on pages without a scene |
| Bundle | 218 KB JS (compressed) without 3D; +~280 KB three.js chunk loaded lazily on capable desktops |
| Local CLS | 0 |

Not verified: real devices (iOS Safari, Android Chrome, low-end laptops), screen readers (VoiceOver/NVDA) end to end, Firefox, and field performance metrics. These need a manual pass before launch.

## Client inputs needed before launch

1. **Policies (FAQ):** confirm the cancellation (“before dispatch; support advises once in transit”) and returns (“pickups arranged and tracked”) wording. Both are flagged with `policyNeedsConfirmation` in `src/content/faq.ts`.
2. **Tracking:** an approved tracking API (endpoint, auth, response schema). Until then a valid number shows a “live tracking isn’t connected yet” message. Also confirm the real AWB format so validation can be tightened (it currently accepts 6–30 letters, numbers and dashes).
3. **Claims:** any statistics, review ratings, testimonials (current names: Rahul Mehta, Priya Sharma, Vikram Singh, Amit Patel, Neha Gupta), service guarantees or coverage you want shown, with evidence and permissions. None are used now.
4. **Legal and social:** privacy, terms and refund-policy URLs, and real social profile URLs. None are linked until supplied.
5. **Logo:** confirmation that the supplied “VayuTrack Express” artwork (`public/brand/`) is the approved mark, and a vector/SVG version if available. The favicon is cropped from this artwork.
6. **Contact:** confirm the hours display (“Monday–Saturday, 10:00 AM–6:00 PM, India time”) and whether the alternate number 0120 463 4067 should appear.
7. **Partnership:** any approved wording about partnership terms. The page currently only invites enquiries.
8. **Articles:** the blog cards use new short excerpts of the existing posts (all dated 10 May 2025); article bodies are the published text. Confirm or replace them.
9. **Forms backend:** an endpoint for booking, enquiries, partner and job applications. Until then they go by email or phone.
10. **Careers:** confirm the six openings, locations and pay ranges (copied from the current careers page) before launch.
11. **About:** confirm the directors’ names and titles, and supply photos if wanted (monogram placeholders are used).
12. **Booking terms:** the current form says “Customer” and “Consignor”; the new form uses “Sender” and “Receiver”. Confirm this matches how bookings are handled.
13. **Locations:** a verified list of service points if `/locate-us` should show results; today it explains that search isn’t connected and offers the head office.
# vayutrack
