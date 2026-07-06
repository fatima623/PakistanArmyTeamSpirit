# CURSOR PROMPT — PATS WEBSITE REDESIGN
# Inspired by paf.gov.pk UI/UX — NOT a copy, adapted for PATS

---

## THE REFERENCE DESIGN (what you are matching in spirit)
The PAF website (paf.gov.pk) has a very specific visual identity:
- Full-viewport hero with a **cinematic video/image slider** cycling through dramatic military photography
- **Dark navy-to-black backgrounds** throughout — never white, never grey
- **Extremely minimal navigation** — logo top-left, nav items center/right, hamburger icon far right
- Typography is **all-caps condensed military stencil** — tight letter-spacing, weight, authority
- Content labels always appear in a **small grey/muted ALL CAPS** line above the big headline
- Horizontal divider lines (thin gold/white) used as separator under headlines, not between sections
- **Image-first sections** — full bleed photography with text overlaid at the bottom-left
- **Color palette**: deep navy (#0d1b2a), near-black (#060a0f), gold-yellow accent (#c8a84b), white text
- Dropdown menus are **dark navy panels**, no borders, ultra-clean
- Footer: dark semi-transparent overlay on a military photograph, multi-column links, no background color blocks
- **"EXPLORE CAREERS | ▼"** style pill button bottom-right — sharp-cornered, outlined, with a split divider
- Hero headline sits **bottom-left** of the full-viewport frame, never centered
- Transitions between hero slides are **crossfade/dissolve** — smooth, cinematic, not sliding
- Section headers appear as **centered spaced caps** with a short decorative underline rule

---

## PATS PROJECT IDENTITY (your project specifics — adapt PAF style here)

Project: **PATS** — Pakistan Army Team Spirit Competition
Color adjustments from PAF:
- Primary: deep army olive-black `#0a0f08` instead of navy
- Accent: military gold `#c8a84b` (keep same as PAF)
- Secondary dark: `#111a0e` (deep forest, not navy)
- Text: `#e8e4d8` (warm white, not pure white)
- Keep all other PAF design decisions

---

## SECTION-BY-SECTION BUILD SPEC

---

### NAV — Transparent-to-solid sticky header

**Layout:** Logo top-left → nav links center → hamburger/close icon top-right (≡ and ✕)

**Behavior:**
- Starts fully transparent over the hero image
- Becomes `rgba(6,10,8,0.95)` with `backdrop-filter: blur(16px)` on scroll past 80px
- Logo: emblem image + "PATS" in condensed caps + "PAKISTAN ARMY TEAM SPIRIT" subtitle in 9px tracked caps below
- Nav items: spaced all-caps condensed, 12px, letter-spacing 0.15em, color `rgba(255,255,255,0.75)`, hover → white
- Active nav item: white, with a subtle gold underline `2px solid #c8a84b`
- Hamburger: custom icon (three stacked lines), top-right corner, opens fullscreen nav overlay
- No background color when hero is visible. No border-bottom on transparent state.

**Dropdown (on hover over nav item):**
- Dark navy panel `#0d1b2a`, no rounded corners, `box-shadow: 0 8px 32px rgba(0,0,0,0.6)`
- Items in all-caps condensed, 13px, white, hover → gold, with `>` arrow for sub-menus
- Appears instantly (no slide animation), disappears on mouse-leave with 150ms delay

---

### HERO — Full-viewport cinematic slider

**Container:** `width: 100vw`, `height: 100vh`, `min-height: 640px`, `overflow: hidden`

**Slides:** 3–4 slides cycling automatically every 5–6 seconds
- Each slide = full-bleed image or video, `object-fit: cover`, `object-position: center`
- Transition: **crossfade** — `opacity` transition on outgoing slide, 1.2s ease

**Overlay:** 
```css
background: linear-gradient(
  to bottom,
  rgba(6,10,8,0.2) 0%,
  rgba(6,10,8,0.05) 40%,
  rgba(6,10,8,0.65) 80%,
  rgba(6,10,8,0.9) 100%
);
```
Plus a subtle left-side vignette: `linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 50%)`

**Content (bottom-left, never centered):**
```
[SMALL GREY LABEL — e.g. "TEAM SPIRIT"]   ← 11px, spaced caps, rgba(255,255,255,0.55)
[BIG ALL-CAPS HEADLINE]                    ← Bebas Neue or Barlow Condensed Bold, clamp(48px,7vw,96px)
[optional 1-line subtitle]                 ← 14px, rgba(255,255,255,0.6), weight 300
```
Position: `position: absolute; bottom: 80px; left: 64px; max-width: 720px`

**Bottom-right CTA pill** (exactly like PAF):
```
[ REGISTER YOUR TEAM  |  ▼ ]
```
Sharp corners (`border-radius: 0`), border `1px solid rgba(255,255,255,0.6)`, no fill.
Two segments — text left + chevron right, separated by a `1px solid` divider.
Position: `position: absolute; bottom: 48px; right: 48px`

**Slide counter:** small dots or `01 / 04` text indicator, bottom-center

---

### SECTION TYPOGRAPHY PATTERN (use on every section)

Every section that has a headline follows this exact 3-line structure:

```
[SMALL LABEL IN MUTED CAPS]       ← 12px (--pats-type-eyebrow), letter-spacing: 0.18em
────────────────                   ← Short gold rule, width ~48px, height 2px, margin: 10px 0
[SECTION HEADLINE IN CAPS]        ← 18px (--pats-type-display), Barlow 700 uppercase
```

**Global type scale (Competition Overview reference — `pats-typography.css`):**
- Eyebrow / label: **14px** semibold uppercase
- Section display title: **clamp(30px → 44px)** bold uppercase
- Body, caption, description, links: **18px** regular
- Feature / card title: **20px** bold
- Feature list heading (`pats-feature-title`): **22px** bold
- Buttons: **16px**, **8px** border radius
- Stat numerals: `--pats-type-stat-value` (metric display)
- Hero slider typography: unchanged (exempt from global remap)

This pattern is sacred. Every headline in the PAF design follows it. No exceptions.

---

### STATS / OVERVIEW STRIP

A full-width dark bar `#0d1a0b`, padding `40px 64px`.
Four stats in a row: `display: grid; grid-template-columns: repeat(4, 1fr)`

Each stat:
- Number: Bebas Neue, 56px, gold `#c8a84b`
- Label: 11px all-caps spaced, `rgba(255,255,255,0.5)`
- Right border `1px solid rgba(255,255,255,0.08)` between cells (not on last)

Example values for PATS: `60 HRS` / `8 STATIONS` / `22+ NATIONS` / `33 TASKS`

---

### CAREER/ROLE IMAGE GRID (like PAF careers page)

Full-bleed 3-column image grid. Each cell is a clickable card:
- Image fills entire card (`aspect-ratio: 16/9` or `3/2`)
- Dark gradient overlay: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)`
- Text sits bottom-left inside the card:
  - `START YOUR JOURNEY WITH PATS` — 10px muted caps
  - `AS A TEAM LEADER` / `AS AN INTERNATIONAL` / `AS AN OBSERVER` — 22px Barlow Condensed 700, white
  - Short gold rule `width:32px height:2px background:#c8a84b margin-top:8px`
- On hover: slight `scale(1.03)` on the image (transform on inner img, not card), `transition: 0.4s ease`
- Red/gold left-border on active/selected card

---

### QUOTE/MISSION BANNER — Centered, cinematic

Full-width section, dark `#080f08`, `padding: 120px 64px`, text centered.

```
[SECTION LABEL — "MISSION / PURPOSE"]
[gold rule]
[Giant centered text — Barlow Condensed 700 or Bebas Neue]
"TO BUILD WARRIORS OF EXCELLENCE"
[1–2 line description below, 15px muted]
```

Use `font-size: clamp(36px, 5vw, 72px)` for the big quote. Max width on text container: 900px.

---

### VIDEO GALLERY SECTION (like PAF's video section)

Layout: Left sidebar title + right 2-column video card grid.

Left: 
- `PATS VIDEO GALLERY` — large Bebas Neue white, ~48px
- Gold rule
- Small descriptor: `LEARN MORE ABOUT PATS` in 11px muted caps
- Width: ~280px

Right: 2 video thumbnail cards side by side
- Thumbnail image with dark overlay
- Play button icon (circle + triangle) centered, `rgba(255,255,255,0.8)`
- Bottom-left: category label (10px muted caps) + title (Barlow Condensed 16px white)

Below: `[ MORE VIDEOS → ]` centered outlined button

---

### DROPDOWN MEGA NAVIGATION (fullscreen overlay)

When hamburger is clicked:
- Full black overlay `rgba(6,10,8,0.98)` slides in from top or fades in
- Large nav items listed vertically: Bebas Neue 64–80px, left-aligned, white
- On hover: item shifts right 8px + turns gold
- Close button top-right (✕)
- Sub-items appear to the right of the selected item
- Footer row at bottom: email + social links in small muted caps

---

### FOOTER

Dark semi-transparent background over a faint background image (military field scene at very low opacity).

Layout:
- Top: 5-column link grid
  - Column heads: `ABOUT` / `OPERATIONS` / `TRAINING` / `INTERNATIONAL` / `MEDIA`
  - Links: 13px, `rgba(255,255,255,0.55)`, hover → white, no underline
  - Column head: 11px, spaced caps, `rgba(255,255,255,0.35)`
- Divider line `1px solid rgba(255,255,255,0.1)`
- Bottom strip: email left + contact right + two sharp-edged buttons (`REGISTER NOW` | `CONTACT US`)
- Very bottom: centered logo + `PAKISTAN ZINDABAD` in Bebas Neue + project tagline below
- Absolutely no white background. No color blocks.

---

## TYPOGRAPHY SYSTEM

| Role | Font | Size | Weight | Transform | Spacing |
|---|---|---|---|---|---|
| Hero headline | Bebas Neue | clamp(52px,8vw,96px) | 400 | UPPERCASE | 0.04em |
| Section title | Barlow Condensed | clamp(32px,5vw,64px) | 700 | UPPERCASE | 0.02em |
| Section eyebrow | Barlow Condensed | 10–11px | 600 | UPPERCASE | 0.25em |
| Card title | Barlow Condensed | 18–24px | 700 | UPPERCASE | 0.04em |
| Nav items | Barlow Condensed | 12px | 600 | UPPERCASE | 0.15em |
| Buttons | Barlow Condensed | 11–13px | 700 | UPPERCASE | 0.18em |
| Body text | Barlow | 14–15px | 300–400 | none | normal |
| Stats number | Bebas Neue | 52–64px | 400 | UPPERCASE | 0.02em |

**Google Fonts import:**
```
https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@300;400;500&display=swap
```

---

## COLOR SYSTEM

```css
:root {
  --bg-deepest:   #060a06;   /* page background, deepest sections */
  --bg-dark:      #0a0f08;   /* main dark bg */
  --bg-navy:      #0d1a10;   /* section alternates */
  --bg-overlay:   #111f0e;   /* cards, panels */
  --border:       rgba(255,255,255,0.08);
  --border-gold:  rgba(200,168,75,0.4);
  --gold:         #c8a84b;
  --gold-light:   #e0c06a;
  --text:         #e8e4d8;   /* main body text */
  --text-muted:   rgba(232,228,216,0.55);
  --text-dim:     rgba(232,228,216,0.3);
  --white:        #ffffff;
}
```

---

## CRITICAL RULES — DO NOT BREAK THESE

1. **NO white or light backgrounds** anywhere. Every section is dark.
2. **NO rounded corners** anywhere — `border-radius: 0` on everything.
3. **NO card shadows** — depth comes from background color differences and photography, not shadows.
4. **NO centered hero text** — always bottom-left aligned.
5. **ALL section labels are muted all-caps small text** with a gold rule below, before the headline.
6. **Photography is everything** — every section uses dramatic full-bleed imagery.
7. **Buttons have NO fill** — they are outline-only with sharp corners. Only primary CTA can be gold-filled.
8. **NAV is transparent** over the hero. Never add a background unless scrolled.
9. **Dropdown menus are dark navy panels**, not white. No border-radius. No box decorations.
10. **Font is Bebas Neue + Barlow Condensed only** — no Inter, no Roboto, no system fonts.

---

## HOW TO USE IN CURSOR

**Step 1 — Set up design tokens first:**
Paste the CSS variables into your global stylesheet before touching any components.

**Step 2 — Build nav first:**
The nav drives everything. Build the transparent/sticky behavior, the logo, the nav links, the hamburger, and the dropdown behavior before any page content.

**Step 3 — Hero second:**
Get the full-viewport crossfade slider working with the bottom-left headline positioning and the bottom-right pill CTA.

**Step 4 — Section by section:**
For each section, always start with the eyebrow + gold rule + headline structure. Then add content inside that frame.

**Step 5 — Tell Cursor:**
> "Build the [section name] section for PATS website. Follow these exact rules: dark backgrounds only, Bebas Neue for headlines, Barlow Condensed for labels and buttons, gold accent #c8a84b, all-caps everywhere, no rounded corners, no white backgrounds. The section eyebrow must be muted 11px all-caps text with a 2px gold rule below it, before the main headline. The layout is [describe your content]. Match the paf.gov.pk visual language but with army olive-dark colors instead of navy."

---

## WHAT THE PAF WEBSITE ACTUALLY DOES (design decisions to steal)

- **Hero crossfades between 3-4 slides** of stunning military photography. The slide label and headline update with each slide. Bottom-left always.
- **The nav is INVISIBLE** on the homepage until you scroll. Total immersion.
- **Sections feel like documentary filmmaking** — cinematic dark frames, images bleed edge to edge, no white gutters.
- **Image cards have text burned into the bottom-left** with a gradient. Not text below the image — text ON the image.
- **The "EXPLORE CAREERS | ▼" button** is split into two halves by a vertical line. This specific detail is signature PAF UI.
- **Video thumbnails have a circle-play button** centered, the category is tiny muted caps, the title is bold condensed caps.
- **Footer uses the photography as background** at very low opacity, letting the dark overlay show through. It feels like the background continues behind the footer.
- **Core values/mission statements** use extremely large centered condensed text — the text IS the design, no decoration needed.
- **Every transition on hover** is `0.3–0.4s ease` — never instant, never slow.

