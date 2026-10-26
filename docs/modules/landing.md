# Landing app

## Purpose

`apps/landing` is the public marketing site of `peaktofan.com`.
It introduces the Tofan app, sends visitors to the App Store and Google Play, and invites coaches to contact the admin.
The October 2026 redesign replaced the first Figma version (file "Tofan Coach - App & Web Design", page `Peaktofan.com`, node `108:2`); the code is now the design source.
Direction: black and gold, an oversized condensed display face (Alumni Sans) for headings, real app screens and a real product photo instead of drawn placeholders.

## Backend

- No endpoint is called. Every text and price is static content in the landing dictionary.
- Access: public, no sign-in.

## Screens

| Route | Page | Rendering |
|---|---|---|
| `/` | Home, Uzbek | prerendered at build time |
| `/ru` | Home, Russian | prerendered at build time |
| `/en` | Home, English | prerendered at build time |
| `/**`, `/ru/**`, `/en/**` | Not found in that language | server-rendered, HTTP 404, `noindex` |

## Structure notes

```text
apps/landing/src/
  main.ts, main.server.ts, server.ts   browser entry, server entry, Express server (healthz, static, SSR)
  styles.css, fonts.css                 design tokens (--landing-*), base styles, shared .btn/.section/.display classes, Inter and Alumni Sans
  app/
    core/config/      EXTERNAL_LINKS, SITE_SECTIONS + NAV_LINKS, footer columns and socials
    core/i18n/        landing dictionary (uz source, ru, en), translateLanding, the `t` pipe, locale paths and routes
    core/layout/      shell (skip link, icon sprite, nav, footer), brand logo, language switcher
    core/seo/         LandingHead (title, description, Open Graph, canonical, hreflang, robots) and route resolvers
    shared/icon/      inline SVG sprite from the Figma icons and the <landing-icon> component
    features/home/    the seven home sections, the framed app screen, their models, the home page
    features/not-found/
    routes/           app.routes.ts (locale routes) and app.routes.server.ts (prerender and 404)
public/
  fonts/              self-hosted Inter and Alumni Sans subsets (latin, latin-ext, cyrillic, cyrillic-ext)
  images/app/         app screens: home, workouts, nutrition, profile (WebP, 720 px wide, transparent rounded corners)
  images/apparel/     the NFC T-shirt photo
```

- The language lives in the URL, not in `localStorage`: `localeRoutes()` builds one route per locale and its resolver calls `LocaleStore.setLocale()`, so the server and the browser always render the same language.
- The landing dictionary is separate from `libs/core/src/i18n/translations` on purpose.
  The panel dictionary holds every admin and coach text in three languages (about 190 KB), and the public site must not ship it.
  Keys are typed the same way (`LandingKey` uses `DictionaryKeys` from `libs/core`), and a missing key in `ru` or `en` breaks the build.
- The landing does not use Optimus UI.
  The design is a custom dark and gold page, and the only interactive parts (menu, language menu, FAQ) are a signal or a native `<details>`; loading the component library would only add weight.
- Sections are linked by fixed ids (`features`, `apparel`, `coaches`, `faq`, `download`) through `routerLink` + `fragment`, so the links work from `/ru` and from a 404 page too.
- Icons are exported from Figma as SVG, kept as `<symbol>`s in `icon-sprite.html` with `stroke="currentColor"` and `vector-effect="non-scaling-stroke"`, so they take the text color and keep the design stroke width at every size.
- Fluid sizes (`clamp()`) interpolate between a 320-390 px phone and a 1440 px desktop; the display headings are checked for overflow at 320 px in all three languages.
- `.display` (Alumni Sans 900, uppercase, tight leading) is the only heading style; body text stays Inter.
  Alumni Sans covers Latin Extended and Cyrillic, so the Uzbek `o‘`/`g‘` and Russian render in the same face.
- App screens are shown through `landing-app-screen`, which draws a thin device frame around the image with container query units, so the frame scales with whatever width the parent gives it.
- Image sizes live in `models/app-screens.ts` and `models/apparel-points.ts` as `SizedImage`, so every `<img>` has `width` and `height` and the layout does not jump while it loads.

## Motion

- Every effect is CSS except the hero tilt; the page renders complete without JavaScript and without motion support.
- Scroll effects use scroll-driven animations (`animation-timeline: view()` / `scroll()`) inside `@supports`, so Firefox and older browsers show the final state with no animation.
- `.reveal` (global, `styles.css`) fades, unblurs and lifts an element as it enters the viewport; `--i` staggers siblings in the same row.
- Hero: the headline words rise one by one on load, the copy and the app screen follow, a gold glow breathes behind the screen, and the screen drifts up while the page scrolls.
- Hero tilt: `HeroSection` turns mouse movement into `--tilt-x`/`--tilt-y` and a pointer spotlight (`models/pointer-tilt.ts`); touch and pen input and reduced motion are ignored.
- The nav is sticky; its glass background and bottom border fade in during the first 120 px of scroll.
- The marquee band repeats its list twice (the copy is `aria-hidden`) and pauses on hover.
- Steps draw a gold line on top as they scroll in, the T-shirt photo settles from a zoom, the NFC dot sends out waves, the download title drifts sideways, FAQ answers open with a height transition (`::details-content`, Chromium only).
- With `prefers-reduced-motion: reduce` no animation runs; component animations are written inside `@media (prefers-reduced-motion: no-preference)` because the global reset cannot override component-scoped selectors without `!important`.
- A fixed film-grain layer (`body::after`, SVG noise at 4.5% opacity) sits over the page and ignores pointer events.

## Images

- The app screens are cut from the Tofan Workout App Store screenshots (October 2026, Uzbek UI).
  The status bar and the debug button of the dev build were removed from them.
  They show the Uzbek interface on `/ru` and `/en` as well; replace them with clean per-language screenshots when the mobile team provides them.
- The T-shirt photo came from the product team at 680 x 852 px; a higher resolution original would look sharper on retina screens.
- The NFC hotspot on the photo is positioned in percent of the photo (`top: 40.5%; left: 50.3%`, the chest logo); move it if the photo is replaced.

## Content decisions

- The em dash is written as a plain dash (project writing rule).
- Section eyebrow labels were dropped: every section title already says what the section is.
- Only released features get a screen; AI coach, community and TofanStore are listed under "Also" with a "Coming soon" tag.
- The QR card shows a real code (`public/images/app-qr.svg`); it is hidden on mobile.
- There is no "Partner trainers" section: the backend has no public trainer list (`GET /trainers` needs a token) and placeholder trainers must not go live.

## Missing content

`core/config/external-links.ts` holds every outside link.
A `null` link renders an anchor without `href` (not clickable) until the real address is known.
Still missing: apparel shop, Telegram channel, Instagram, YouTube, privacy policy, terms of use, refund policy.

## Production

`Dockerfile.landing` builds `dist/landing` and runs `node dist/landing/server/server.mjs` on port 4000 as the `node` user.

- `GET /healthz` returns `ok`.
- `GET /app` redirects (302) to the App Store on iPhone, iPad and iPod and to Google Play everywhere else (`core/config/app-download.ts`). The QR code encodes `https://peaktofan.com/app`, so one code serves both stores; it only works once the site runs on `peaktofan.com`.
  To regenerate the QR (for example for another address), run the `qrcode` npm package once outside the project with `errorCorrectionLevel: 'M'`, `margin: 0` and a transparent light color; it is not a project dependency.
- Hashed JS and CSS are cached for a year (`immutable`), other public files for a day, pages are `no-cache`.
- Security headers match the panels: `nosniff`, `X-Frame-Options: DENY`, `strict-origin-when-cross-origin`.
- `security.allowedHosts` in `angular.json` lists `peaktofan.com`, `www.peaktofan.com` and localhost; SSR rejects any other `Host`, so add a staging host there before deploying one.

## Traps

- Do not read the locale from `localStorage` or the browser in the landing: it must come from the route, or hydration renders a different language than the server.
- Do not format numbers with `Intl` for Uzbek: Chrome ships no Uzbek locale data and falls back to English, so the browser would rewrite "4,9" to "4.9" after hydration. Keep such text in the dictionary or format it with a pure function.
- A class on a child component's host element also matches the parent's styles (emulated encapsulation); the brand logo uses `footer-logo`, not `footer`, for that reason.
- If the mobile app uses `peaktofan.com` for universal links (`/t/<slug>`), `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` must be served by this server.
