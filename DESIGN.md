---
name: Feryshop
colors:
  surface: '#FAFAFA'
  surface-dim: '#E4E4E7'
  surface-bright: '#FFFFFF'
  surface-container-lowest: '#FFFFFF'
  surface-container-low: '#F7F7F8'
  surface-container: '#F2F2F3'
  surface-container-high: '#EAEAEC'
  surface-container-highest: '#D4D4D8'
  on-surface: '#18181B'
  on-surface-variant: '#6E6E75'
  inverse-surface: '#0F0F0F'
  inverse-on-surface: '#FAFAFA'
  outline: '#71717A'
  outline-variant: '#DFDFE3'
  surface-tint: '#F97A14'
  primary: '#F97A14'
  on-primary: '#18181B'
  primary-container: '#FFF0E5'
  on-primary-container: '#7A3100'
  inverse-primary: '#FFB377'
  secondary: '#3F3F46'
  on-secondary: '#FFFFFF'
  secondary-container: '#EFEFF1'
  on-secondary-container: '#27272A'
  tertiary: '#A855F7'
  on-tertiary: '#FFFFFF'
  tertiary-container: '#F3E8FF'
  on-tertiary-container: '#581C87'
  error: '#B91C1C'
  on-error: '#FFFFFF'
  error-container: '#FEE2E2'
  on-error-container: '#450A0A'
  primary-fixed: '#FFF0E5'
  primary-fixed-dim: '#FFB377'
  on-primary-fixed: '#5C2500'
  on-primary-fixed-variant: '#A84300'
  secondary-fixed: '#EFEFF1'
  secondary-fixed-dim: '#D4D4D8'
  on-secondary-fixed: '#18181B'
  on-secondary-fixed-variant: '#52525B'
  tertiary-fixed: '#F3E8FF'
  tertiary-fixed-dim: '#D8B4FE'
  on-tertiary-fixed: '#3B0764'
  on-tertiary-fixed-variant: '#7E22CE'
  background: '#FAFAFA'
  on-background: '#18181B'
  surface-variant: '#EFEFF1'
  success: '#15803D'
  on-success: '#FFFFFF'
  success-container: '#DCFCE7'
  on-success-container: '#14532D'
  info: '#2563EB'
  on-info: '#FFFFFF'
  info-container: '#DBEAFE'
  on-info-container: '#172554'
typography:
  display-lg:
    fontFamily: Noto Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Noto Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-sm:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  table-data:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  headline-md-mobile:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 6px
  DEFAULT: 10px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  base: 4px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 32px
  sidebar-width: 320px
  max-content-width: 1296px
---

## Brand & Style

Feryshop is a design system for a game top-up and digital voucher marketplace. It is optimized for fast product discovery, clear pricing, trustworthy checkout flows, and responsive access across desktop and mobile devices.

The visual identity combines a clean commerce interface with energetic gaming artwork. Neutral near-black and warm-gray foundations communicate technical depth, while vivid orange communicates energy, speed, and decisive action. Restrained violet accents distinguish selected campaigns without competing with the main brand color.

Game artwork should provide most of the visual excitement. Interface chrome should remain restrained, readable, and consistent.

The intended personality is **modern, technical, trustworthy, energetic, decisive, and efficient**.

The primary content hierarchy is:

1. Promotional hero banner.
2. Flash Sale and countdown.
3. Popular games and product categories.
4. Complete game catalog.
5. Frequently asked questions.
6. Footer and supporting navigation.

## Colors

The palette uses semantic roles so that components remain consistent across light and dark themes. Every foreground color must be paired with its corresponding `on-*` token. Normal text should meet a minimum WCAG AA contrast ratio of `4.5:1`.

- **Primary — Vivid Orange:** `#F97A14` is used for primary calls to action, active navigation, selected states, focus indicators, important prices, and key purchase actions.
- **Secondary — Neutral Graphite:** `#3F3F46` supports secondary actions, metadata, neutral controls, and less prominent navigation.
- **Tertiary — Campaign Violet:** `#A855F7` is reserved for special campaigns, loyalty features, limited-event badges, and occasional promotional accents.
- **Neutral — Warm Zinc:** Surface tokens progress from white to warm gray. They define page backgrounds, cards, form fields, borders, muted text, and section separation.
- **Status Colors:** Red is reserved for errors, failed transactions, destructive actions, and genuinely urgent states. Blue is used only for informational messages, while green is reserved for successful transactions and completed actions.

### Brand Mark Contrast

The Feryshop logo asset uses transparent pixels plus blue, orange, and a white ribbon. The white ribbon must never sit directly on `background`, `card`, `surface-bright`, or any other white/light surface. Use `inverse-surface` (`#0F0F0F`) as the preferred brand-mark background, or place the logo inside a compact near-black/graphite badge when the surrounding header, sidebar, or footer remains light.

**The White Ribbon Rule.** Wherever the raw transparent logo appears, the immediate background behind the mark must provide at least `3:1` non-text contrast against white. `#0F0F0F` is the default safe background; `#3F3F46` is acceptable for compact logo badges. Do not use orange, violet, white, `#FAFAFA`, or translucent light surfaces behind the raw logo unless the white ribbon is outlined or replaced with a light-mode logo asset.

Do not use orange for every interface element. Reserve it for actions, selection, focus, important prices, and meaningful brand emphasis.

Do not use violet for ordinary navigation or red for decorative promotions. Urgency and status must never depend on color alone; pair them with text, icons, labels, or patterns.

### Light Theme Reference

```css
.light {
  --background: 0 0% 98%;
  --foreground: 240 6% 10%;

  --card: 0 0% 100%;
  --card-foreground: 240 6% 10%;

  --popover: 0 0% 100%;
  --popover-foreground: 240 6% 10%;

  --primary: 24 95% 53%;
  --primary-foreground: 240 6% 10%;

  --secondary: 240 5% 94%;
  --secondary-foreground: 240 6% 15%;

  --muted: 240 5% 95%;
  --muted-foreground: 240 4% 45%;

  --accent: 24 95% 95%;
  --accent-foreground: 24 90% 35%;

  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;

  --border: 240 6% 88%;
  --input: 240 6% 88%;
  --ring: 24 95% 53%;

  --radius: 0.5rem;
  --my-color: 24 95% 53%;
}
```

### Dark Theme Reference

```css
.dark {
  --background: 0 0% 2%;
  --foreground: 0 0% 98%;

  --card: 0 0% 6%;
  --card-foreground: 0 0% 98%;

  --popover: 0 0% 6%;
  --popover-foreground: 0 0% 98%;

  --primary: 24 95% 53%;
  --primary-foreground: 240 6% 10%;

  --secondary: 240 5% 15%;
  --secondary-foreground: 0 0% 98%;

  --muted: 240 5% 12%;
  --muted-foreground: 240 5% 65%;

  --accent: 240 5% 15%;
  --accent-foreground: 0 0% 98%;

  --destructive: 0 62.8% 40%;
  --destructive-foreground: 0 0% 98%;

  --border: 240 5% 15%;
  --input: 240 5% 15%;
  --ring: 24 95% 53%;

  --radius: 0.5rem;
  --my-color: 24 95% 53%;
}
```

## Typography

**Noto Sans** is the primary typeface because it is highly legible at compact marketplace sizes and reliably supports Indonesian and international text.

`body-md` is the standard style for product descriptions, form controls, and most interface copy. `label-md` is used for buttons, tabs, field labels, and compact navigation. `body-sm` is limited to publisher names, countdown labels, and secondary metadata. `table-data` is reserved for price lists, transaction history, and structured numerical content.

Headings use a bold `700` weight. Body content uses `400`, while labels use `600`. Current prices are bold; previous prices use a muted color and strikethrough. Promotional banner typography may use `display-lg`, but normal page sections should use `headline-md` or `headline-sm`.

Do not render essential interface text smaller than `12px`. On mobile, replace `headline-md` with `headline-md-mobile` when the larger style causes wrapping or obscures nearby controls.

## Layout & Spacing

Feryshop uses a responsive 12-column grid and a `4px` baseline spacing unit. Major sections share a centered container with a maximum width of `1296px`. Desktop page margins are `32px`; mobile margins are `16px`; standard card and carousel gaps are `20px`.

Home-page sections—notification bar, hero carousel, Flash Sale, game categories, catalog, FAQ, and footer content—must align to the same primary container whenever their visual treatment does not intentionally span the viewport.

The game catalog uses:

- Six columns on desktop.
- Three columns on tablet.
- Two columns on mobile.

The Flash Sale carousel displays:

- Four cards on desktop.
- Three cards on tablet.
- Approximately `1.5` cards on mobile to reveal that the row is horizontally scrollable.

### Breakpoints

- **Mobile (<768px):** Use `16px` page margins. Collapse desktop navigation into compact search and menu controls. Display two game cards per row, one complete hero slide, and horizontally scrollable tabs. Authentication actions may move into the off-canvas menu.
- **Tablet (768px–991px):** Use three game-card columns and three Flash Sale cards. Preserve the search field when space allows, but move secondary navigation into an overflow or off-canvas menu.
- **Desktop (≥992px):** Use the full navigation bar, six-column game catalog, four-card Flash Sale row, and centered content up to `1296px`.

The fixed header must reserve its own layout space so that it never covers page content. Avoid arbitrary body padding disconnected from the actual header height.

## Elevation & Depth

Feryshop avoids heavy shadows. Depth is created through surface contrast, subtle borders, image overlays, and restrained elevation.

- **Level 0 — Background:** `#FAFAFA` for the page canvas and lowest application layer.
- **Level 1 — Surface:** `#FFFFFF` for navigation, cards, form fields, FAQ items, dialogs, and content containers. Use a subtle `1px` outline or `0 2px 8px rgba(0, 0, 0, 0.06)` shadow.
- **Level 2 — Interactive or Overlay:** Use `0 8px 24px rgba(0, 0, 0, 0.12)` for dropdowns, active floating controls, carousel navigation, and elevated interactive panels.

Dialogs and off-canvas panels may use `0 16px 40px rgba(0, 0, 0, 0.16)`. Promotional cards should create depth through artwork, dark gradient overlays, and foreground content rather than large shadows.

The sticky header may use a translucent surface with backdrop blur but must provide an opaque fallback for unsupported browsers.

## Shapes

The design uses soft, modern rounded corners. Shapes should feel approachable without becoming playful or excessively pill-shaped.

- **Small elements:** `6px` for badges and compact price labels.
- **Standard elements:** `10–12px` for buttons, inputs, tabs, product cards, and icon buttons.
- **Containers:** `16–24px` for hero banners, FAQ panels, dialogs, and off-canvas panels.
- **Circular or pill elements:** `9999px` for social icons, status chips, and floating support buttons.

All interactive targets must be at least `44 × 44px`. Components nested inside rounded containers should use the same radius or a slightly smaller radius based on their internal padding.

## Components

### Product and Game Cards

Product cards use a consistent image ratio, rounded corners, and a subtle shadow or outline. Game artwork covers the card, while the game name sits over a dark bottom gradient to maintain legibility. A small Feryshop watermark may appear without competing with the game title.

Flash Sale cards contain the product name, current price, crossed-out original price, and optional discount information. Use orange for current-price emphasis only when it improves hierarchy; avoid turning every number orange.

The complete card may be clickable, but hover and keyboard-focus states must clearly communicate interactivity.

On hover-capable devices, use subtle elevation or scale. Disable nonessential transforms when `prefers-reduced-motion: reduce` is enabled.

### Action Buttons

- **Primary:** Solid vivid-orange background with dark high-contrast text. Use for purchase progression, checkout confirmation, Sign In, Download, and other important actions.
- **Secondary:** Transparent or white surface with an orange outline and orange or dark text. Use for Register and supporting actions.
- **Neutral:** Graphite or neutral-gray treatment for actions that should remain available without competing with purchase actions.
- **Danger:** Solid error red with white text. Use only for destructive or irreversible actions, not ordinary promotional urgency.

Purchasing and checkout actions should have higher visual priority than authentication actions when both appear on the same screen.

All buttons require default, hover, active, focus-visible, disabled, and loading states. The minimum control height is `44px`.

### Form Fields

Inputs use a light surface-container background, `12px` radius, and a visible field label. Place search or visibility icons inside the field without replacing the label.

On focus, use a `2px` primary outline or an equivalent accessible focus ring. On error, use the error color for the border and provide nearby explanatory text. Preserve user-entered values after validation errors.

Placeholders use `on-surface-variant`; they must not be the only source of instructions. Disabled fields remain readable and expose their state semantically.

### Sticky Header and Navigation

The desktop header contains:

- Feryshop shield logo and wordmark.
- Prominent “Search Games” field.
- Filled “Sign In” button.
- Outlined “Register” button.
- Grid-menu control.
- Light/dark theme toggle.

The application-download notification bar appears directly below the header with a Download CTA and close control.

On mobile, retain the logo, search access, and menu trigger. Move account actions and secondary destinations—Home, Price List, Track Transaction, Contact Us, and Calculator—into an off-canvas panel. Icon-only controls require accessible labels and visible focus states.

In light mode, the transparent Feryshop logo must not be placed directly on the header canvas. Either give the logo its own compact `inverse-surface`/graphite badge with enough internal padding, or use a light-mode-specific logo asset whose white ribbon has a dark outline or replacement fill. The wordmark can remain `text-foreground`; only the mark needs the protected background.

Use orange only for active navigation, focus indication, and primary actions. Normal navigation should remain neutral.

### Hero Carousel

The hero uses a full-width promotional banner with game artwork, a prominent campaign headline, and optional promotional copy. Desktop may reveal adjacent slides; mobile displays one complete slide.

Autoplay should use a minimum four-second interval and pause on hover, keyboard focus, or direct interaction. Provide manual previous and next controls. Navigating banners must use semantic links rather than click handlers on generic containers.

Orange may appear in campaign CTAs, but the artwork should remain the dominant visual element.

### Flash Sale and Countdown

The section heading combines a lightning icon, “Flash Sale” label, and a live countdown. Each countdown unit includes both the number and its label: Days, Hours, Minutes, and Seconds.

Use orange for the main CTA, lightning icon, or current-price emphasis. Do not combine saturated orange, violet, and red in the same compact area unless each color has a distinct semantic role.

When the countdown reaches zero, stop the timer and replace it with a clear “Promotion ended” state. Do not restart a countdown automatically unless a genuinely new campaign has begun.

### Category Tabs

Use pill-shaped tabs for Game Top-ups, Game Vouchers, and Electricity Tokens.

The active tab uses a soft orange `primary-container` surface, dark text, a visible border, and an optional indicator. A saturated orange fill may be used when only a small number of tabs is visible.

Inactive tabs use neutral or outlined treatments. Selection must be communicated through shape, border, or indicator changes in addition to color.

Tabs may scroll horizontally on mobile. Use correct tab semantics and preserve the user's position when switching categories.

### FAQ Accordion

FAQ items use a light neutral container, rounded corners, and clear question text. Expanding an item reveals the answer with a short, smooth transition. Only one item may remain open when reducing vertical scanning is beneficial.

Accordion triggers must be keyboard accessible and expose their expanded state through `aria-expanded`.

Use orange sparingly for focus indicators or expansion icons rather than the entire FAQ surface.

### Footer

The footer uses the near-black `inverse-surface` background with `inverse-on-surface` text. It includes the Feryshop logo, a concise tagline, circular social-media buttons, copyright information, and links to Home, Top-up, Terms and Conditions, and Contact Us.

Recommended footer colors:

- Background: `#0F0F0F`
- Primary text: `#FAFAFA`
- Muted text: `#A2A2AB`
- Links and small accents: `#F97A14`
- Borders: `#242428`

The footer is the safest natural home for the raw logo because `inverse-surface` preserves the white ribbon. If a light footer is used for a campaign or embedded layout, the logo must move into the same protected near-black badge used in the header.

Social icons must include accessible names. Footer links need visible hover and keyboard-focus states.

### Floating Customer Support

Place a fixed “CHAT WITH SUPPORT” action at the bottom-right corner.

The preferred treatment is a near-black control with an orange icon and light text:

- Background: `#18181B`
- Icon: `#F97A14`
- Text: `#FAFAFA`

A solid orange control may be used when the page does not already contain several prominent purchase actions.

The control must respect mobile safe-area insets and must never obscure checkout controls, mobile navigation, or important content.

### Dark Mode

Light mode is the default unless the user or system has an established dark preference. Store an explicit user choice and respect `prefers-color-scheme` on first visit.

In dark mode:

- Use near-black `#050505` for the page background.
- Use `#0F0F0F` for cards, dialogs, navigation, and elevated surfaces.
- Use `#242428` for secondary controls, inputs, borders, and hover states.
- Use `#FAFAFA` for primary text and `#A2A2AB` for secondary text.
- Preserve vivid orange `#F97A14` for primary actions, focus states, selected states, and important prices.
- Use orange sparingly so purchase actions remain visually dominant.
- Use violet only for selected campaign or loyalty accents.
- Strengthen image overlays when artwork reduces text legibility.
- Replace light-mode shadows with subtle borders and restrained dark elevation.

The theme toggle must expose its state programmatically, for example through `aria-pressed`.

## Accessibility

- Normal text should meet a minimum contrast ratio of `4.5:1`.
- Large text should meet a minimum contrast ratio of `3:1`.
- Interactive controls and meaningful graphical elements should meet a minimum contrast ratio of `3:1` against adjacent colors.
- The white segment of the transparent Feryshop logo is a meaningful graphical element; test it against its immediate rendered background, not the page-level theme token.
- Never communicate status, urgency, discounts, or selection through color alone.
- Use visible `focus-visible` styles for all interactive elements.
- Respect `prefers-reduced-motion`.
- Provide accessible names for icon-only buttons.
- Preserve semantic heading order and landmark structure.
- Ensure all core flows are usable with keyboard navigation.
- Ensure touch targets are at least `44 × 44px`.

## Brand Usage Summary

Use the palette according to this hierarchy:

1. **Orange** for decisions, actions, selection, focus, and important prices.
2. **Near-black and graphite** for technical depth, navigation, and premium contrast.
3. **White and warm-gray surfaces** for readability and dense marketplace content.
4. **Violet** for occasional special campaigns or loyalty features.
5. **Red, green, and blue** only for their semantic status roles.

The interface should not look orange everywhere. A strong Feryshop identity comes from consistent placement of orange against neutral surfaces, not from maximizing orange coverage.
