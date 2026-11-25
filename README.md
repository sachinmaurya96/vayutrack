# VayuTrack V2 — homepage

The next version of the VayuTrack homepage, built around an interactive miniature logistics world: “Every shipment. A connected journey.”

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · three.js r182 via React Three Fiber 9 and Drei 10 · Motion 14.

## Run it

Requires Node.js 20.9+ (verified on Node 24).

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build        # type-checks and prerenders the page as static HTML
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

## How the page is put together

```
src/
  app/                    layout (Manrope font, metadata, skip link), page, global tokens
  content/                ALL copy, URLs, contact facts, FAQ, services, journey, scene text
  lib/tracking/           validation, the DEMO-VT-001 fixture, the tracking adapter
  components/
    layout/               header (menus + mobile dialog), footer
    sections/             one file per homepage section
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

**One canvas.** The hero, service explorer and journey are three “slots”. A single WebGL canvas lives in whichever slot is most visible. Before it leaves a slot it captures a still frame, so the slot keeps showing the same composition; slots it has not visited yet get a pre-rendered still as they scroll into view.

**One world.** Hub, sender's home, destination, airport and port share one coordinate system. Choosing Air or Ocean flies the camera across the same world.

**Rendering budget.** The page HTML renders before any 3D code loads. three.js loads lazily after the page is idle and only on viewports 768px and wider with a capable GPU. Rendering is on demand: it stops when no scene is on screen, when the tab is hidden, or when motion is paused. Ambient motion renders at about 30fps; camera transitions run at full rate. Pixel ratio is capped at 1.75, and repeated props (trees, parcels, containers, road marks) are instanced.

**Fallbacks.** The designed SVG illustration is used while 3D loads, on phones, without WebGL, on low-power devices (≤2 cores or ≤2 GB memory, Save-Data, software renderers), after a WebGL error, and after context loss. Selection, service tabs and journey stages drive it the same way.

## Editing content

All customer-facing text and destinations are in `src/content/`:

- `site.ts` — URLs, contact details, navigation, footer groups
- `home.ts` — hero, capabilities, story, use cases, partnership, articles, final CTA
- `services.ts`, `journey.ts`, `sceneObjects.ts`, `faq.ts`

No statistics, testimonials, client logos, guarantees or coverage claims are included.

## Tracking

Real tracking and the demo are kept separate.

- **Default (no API configured):** the widget validates the number locally and hands the visitor to `https://vayutrack.com/track`, with a “Copy number” helper. It does not pretend a lookup happened and does not guess query parameters.
- **“Try the sample journey”:** shows the fixed `DEMO-VT-001` fixture, always labelled “Illustrative demo — not a live shipment.” A typed number never produces sample events; typing `DEMO-VT-001` into the real field points the visitor to the sample action instead.
- **When an approved API exists:** set `NEXT_PUBLIC_TRACKING_API_URL` to a URL template containing `{awb}` (for example `https://api.example.com/v1/shipments/{awb}`), then adapt `normalizeTrackingResponse` in `src/lib/tracking/adapter.ts` to the documented response. The widget already handles empty, invalid, loading, not-found (HTTP 404), network-error, server-error and success states. The current response mapping is a placeholder contract.

Forms (booking, business enquiry, partner, contact) link to the existing pages. Nothing on this page reports a submission as sent.

## Verification (25 Nov 2026)

Run against `next build` + `next start` in Chrome (Playwright, hardware WebGL via Apple M4/Metal), plus `next dev` for iteration.

| Check | Result |
| --- | --- |
| Production build, `tsc --noEmit`, ESLint | Pass, no errors |
| Console errors / warnings | None in default, reduced-motion, no-WebGL and mobile runs |
| Layout at 1440×900, 1280×800, 1024×768, 768×1024, 390×844 | Reviewed by screenshot; no horizontal overflow from 320px to 1440px |
| Headline / tracking / scene order on mobile | Headline, actions and tracking come before the scene |
| One `h1`, landmarks, labelled form, linked error message | Pass |
| Keyboard: skip link, Services menu (Enter/Escape, focus return), service tabs (arrow keys), FAQ (Enter/Space), mobile menu (focus trap, Escape, focus return) | Pass; focus ring visible |
| Scene ↔ HTML sync | Object buttons and clicking objects in the canvas select the same item; Reset View returns to the overview |
| Pause Motion | Canvas pixels stop changing while paused |
| Reduced motion | No ambient motion; camera changes snap; control reads “Motion reduced” |
| Offscreen / hidden tab | 0 WebGL draw calls when no scene is visible or the tab is hidden |
| No WebGL (`--disable-webgl`) | No canvas, no three.js download; SVG world works with all controls |
| WebGL context loss | Canvas removed, SVG illustration shown |
| Tracking | Empty, invalid, sample-ID, valid hand-off and sample journey verified; API states verified against a mocked endpoint |
| Destinations | All 15 external URLs returned HTTP 200 on 25 Nov 2026; all in-page anchors resolve |
| Bundle | 218 KB JS (compressed) without 3D; +~280 KB three.js chunk loaded lazily on capable desktops |
| Local CLS | 0 |

Not verified: real devices (iOS Safari, Android Chrome, low-end laptops), screen readers (VoiceOver/NVDA) end to end, Firefox, and field performance metrics. These need a manual pass before launch.

## Client inputs needed before launch

1. **Policies (FAQ):** confirm the cancellation (“before dispatch; support advises once in transit”) and returns (“pickups arranged and tracked”) wording. Both are flagged with `policyNeedsConfirmation` in `src/content/faq.ts`.
2. **Tracking:** an approved tracking API (endpoint, auth, response schema), or confirmation that the hand-off to `/track` is the intended flow. Also confirm the real AWB format so validation can be tightened (it currently accepts 6–30 letters, numbers and dashes).
3. **Claims:** any statistics, review ratings, testimonials (current names: Rahul Mehta, Priya Sharma, Vikram Singh, Amit Patel, Neha Gupta), service guarantees or coverage you want shown, with evidence and permissions. None are used now.
4. **Legal and social:** privacy, terms and refund-policy URLs, and real social profile URLs. None are linked until supplied.
5. **Logo:** confirmation that the supplied “VayuTrack Express” artwork (`public/brand/`) is the approved mark, and a vector/SVG version if available. The favicon is cropped from this artwork.
6. **Contact:** confirm the hours display (“Monday–Saturday, 10:00 AM–6:00 PM, India time”) and whether the alternate number 0120 463 4067 should appear.
7. **Partnership:** any approved wording about partnership terms. The page currently only invites enquiries.
8. **Articles:** the three insight excerpts are new summaries of the existing posts (all dated 10 May 2025). Confirm or replace them.
9. **Forms backend:** if a homepage enquiry form is wanted, provide the endpoint. The page currently links to the existing enquiry and booking pages.
# vayutrack
