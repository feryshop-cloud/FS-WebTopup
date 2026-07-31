---
name: Feryshop
description: Marketplace akun game dan top up dengan visual gelap, cepat, dan terpercaya.
colors:
  background: "hsl(0 0% 2%)"
  foreground: "hsl(0 0% 98%)"
  card: "hsl(0 0% 6%)"
  card-foreground: "hsl(0 0% 98%)"
  primary-orange: "hsl(24 95% 53%)"
  primary-orange-hover: "hsl(24 95% 45%)"
  logo-blue: "#00A2E9"
  logo-white: "#FFFFFF"
  secondary: "hsl(240 5% 15%)"
  muted: "hsl(240 5% 12%)"
  muted-foreground: "hsl(240 5% 65%)"
  border: "hsl(240 5% 15%)"
  destructive: "hsl(0 62.8% 40%)"
typography:
  display:
    fontFamily: "Geist, Arial, sans-serif"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0"
  headline:
    fontFamily: "Geist, Arial, sans-serif"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "Geist, Arial, sans-serif"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  sm: "calc(0.5rem - 4px)"
  md: "calc(0.5rem - 2px)"
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary-orange}"
    textColor: "{colors.logo-white}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-orange-hover}"
    textColor: "{colors.logo-white}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-blue-accent:
    backgroundColor: "{colors.logo-blue}"
    textColor: "{colors.logo-white}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  input-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
    height: "2.25rem"
---

# Design System: Feryshop

## Overview

**Creative North Star: "Midnight Game Counter"**

Feryshop uses a dark, compact commerce interface built for repeat game transactions: quick scanning, direct action, and strong trust cues. The base is near-black, cards are only slightly lifted from the page, and color is reserved for status, active navigation, purchase intent, and brand recognition.

The logo defines a three-accent identity: orange for primary commerce action, blue for system energy and navigation accent, and white for clarity. The blue accent must feel like it belongs to the logo, not like a separate tech theme.

**Key Characteristics:**
- Dark-first marketplace surfaces with high-contrast text.
- Orange remains the main CTA and pricing accent.
- Logo blue is a supporting accent for navigation, shimmer, focus, verified cues, and informational states.
- Cards are dense, practical, and content-led.
- Motion is subtle and used to communicate live activity or hover response.

## Colors

The palette is a black storefront with warm commerce orange and logo-derived electric blue.

### Primary
- **Commerce Flame** (`hsl(24 95% 53%)`): primary CTA, selected filters, active chips, prices, rating stars, and high-intent actions.
- **Commerce Flame Hover** (`hsl(24 95% 45%)`): hover and pressed state for primary action controls.

### Secondary
- **Feryshop Blue** (`#00A2E9`): logo-aligned accent for navigation bars, focus rings when a screen already uses orange heavily, informational badges, fast-delivery cues, and slim progress or shimmer details.
- **Logo White** (`#FFFFFF`): logo highlight and high-contrast text on saturated accents.

### Neutral
- **Storefront Black** (`hsl(0 0% 2%)`): page background.
- **Panel Black** (`hsl(0 0% 6%)`): cards, popovers, dropdowns, and modal surfaces.
- **Muted Panel** (`hsl(240 5% 12%)`): subdued containers, inactive controls, and separators.
- **Soft Border** (`hsl(240 5% 15%)`): card borders, input borders, dividers, and low-emphasis outlines.
- **Muted Text** (`hsl(240 5% 65%)`): secondary labels, descriptions, helper text, and inactive navigation labels.

### Named Rules

**The Blue Belongs to the Logo Rule.** Use `#00A2E9` as a precise accent tied to the Feryshop mark: nav underline, shimmer, focus, verified/informational cues, and small icon states. Do not let it replace orange as the default purchase CTA.

**The Two-Accent Limit Rule.** A single component may use orange and blue together only when one is clearly dominant and the other is a hairline, icon, glow, or state marker.

## Typography

**Display Font:** Geist with Arial and sans-serif fallbacks.
**Body Font:** Geist with Arial and sans-serif fallbacks.
**Label Font:** Geist with Arial and sans-serif fallbacks.

**Character:** Typography is direct, compact, and commerce-focused. It should support scanning prices, game names, status labels, and action buttons without turning the UI into a marketing poster.

### Hierarchy
- **Display** (800, tight leading): home or marketplace hero headlines only.
- **Headline** (700, compact leading): section headings, product group titles, and major account detail blocks.
- **Title** (600-700, compact leading): card titles, modal titles, and navigation groups.
- **Body** (400, comfortable leading): descriptions, instructions, article excerpts, and payment details.
- **Label** (700, compact leading): badges, tabs, filters, price labels, and compact controls.

### Named Rules

**The No Squeeze Rule.** Keep letter spacing at `0`; do not use negative tracking or viewport-scaled font sizes.

## Layout

Layouts are dense but not cramped. The system uses centered containers, 2rem container padding, and a 1400px maximum width at the largest breakpoint. Navigation is sticky, compact, and split into a top identity/action row plus a desktop menu row.

Marketplace and account screens should favor grid scanning, short labels, visible price hierarchy, and clear filter affordances. Mobile layouts must keep fixed-format controls stable with explicit heights, widths, grid tracks, or aspect ratios so labels and icons do not shift.

## Elevation & Depth

Depth is restrained. The interface relies on tonal layering, borders, and small shadows rather than large floating cards. Shadows are acceptable on interactive controls and cards, but the dark surface contrast should carry most of the hierarchy.

### Shadow Vocabulary
- **Card Shadow** (`shadow`): default card and sticky navigation separation.
- **Small Control Shadow** (`shadow-sm`): outline and secondary controls.
- **Blue Shimmer Glow** (`0 0 8px rgba(59,130,246,0.5)`): slim animated navigation/progress accents only.

### Named Rules

**The Thin Glow Rule.** Blue glow should appear as a slim accent, progress trace, or focus halo, not as a large decorative background.

## Shapes

The base radius is 0.5rem. Buttons and inputs use medium rounded corners, cards use larger rounded corners when showing product/account content, and badges may use full pill shapes for compact metadata. The logo is fluid, but UI geometry stays controlled and utilitarian.

## Components

### Buttons
- **Shape:** medium rounded controls (`0.5rem` family).
- **Primary:** orange background with white text for purchase, signup, submit, and confirm actions.
- **Blue Accent:** reserved for informational actions, active navigation details, API/developer affordances, and secondary emphasis where orange would imply purchase.
- **Hover / Focus:** use color shift plus focus ring; prefer blue focus when the surrounding surface already contains orange CTA.
- **Ghost:** transparent by default, low-emphasis text, and subtle hover background.

### Chips
- **Style:** selected chips use orange tint, orange text, and a soft orange border.
- **Blue Usage:** blue chips are allowed for verified, delivery, API, or invoice informational states.
- **State:** active state must be visually clear through color and border, not only text weight.

### Cards / Containers
- **Corner Style:** gently rounded marketplace cards (`0.75rem` to `1rem`).
- **Background:** panel black on storefront black.
- **Shadow Strategy:** low shadow with border contrast.
- **Internal Padding:** 1rem for dense cards, 1.5rem for form and account detail containers.

### Inputs / Fields
- **Style:** dark background, soft border, compact height.
- **Focus:** visible ring using the active accent. Orange is default; blue is preferred in search, navigation, and informational workflows.
- **Error / Disabled:** destructive red for errors; disabled controls reduce opacity and remove pointer interaction.

### Navigation
- **Style:** sticky dark header with logo mark, compact brand text, search/action cluster, and desktop menu row.
- **Active State:** active navigation text uses orange for selected destinations.
- **Brand Accent:** the bottom shimmer bar uses logo blue/cyan with a white sweep. Keep it slim and full-width.
- **Mobile Treatment:** preserve compact icon-first navigation and avoid long labels that wrap inside fixed controls.

## Do's and Don'ts

### Do:
- **Do** use Feryshop Blue (`#00A2E9`) for slim brand accents, focus states, informational badges, and secondary icon states.
- **Do** keep Commerce Flame (`hsl(24 95% 53%)`) as the primary buying and selected-state color.
- **Do** keep dark surfaces close together in value, using borders and spacing to separate content.
- **Do** make cards scannable with tight headings, visible prices, and compact metadata.
- **Do** keep the logo visible in the first navigation row.

### Don't:
- **Don't** replace purchase CTAs with blue by default.
- **Don't** use blue as a large decorative wash, orb, or page background.
- **Don't** combine multiple saturated gradients on the same surface.
- **Don't** create nested cards for ordinary page sections.
- **Don't** scale typography with viewport width or use negative letter spacing.
