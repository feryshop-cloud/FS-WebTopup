# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Feryshop is for Indonesian customers who need to buy game top-ups, digital vouchers, and marketplace game accounts quickly from desktop or mobile web. Registered members can manage account details, check order history, use promotions, and access account/API features.

## Product Purpose

Feryshop provides a customer-facing storefront and transaction interface for digital product purchases. Success means users can find the right game or account, enter the required game/account data, choose payment, complete checkout, and track invoice/payment/order status with minimal friction.

## Positioning

The product combines top-up ordering, marketplace account browsing, promo handling, invoice lookup, member dashboard, WhatsApp/OTP authentication, and real-time transaction status in one branded Feryshop web experience.

## Operating Context

Users browse product categories, popular games, account marketplace listings, articles, price lists, calculators, and order pages. Checkout depends on product configuration, payment methods, promo-code validation, invoice generation, and payment/order status updates. Account workflows include Google login, email/password login, WhatsApp OTP, password reset, profile settings, API credentials, and invoice lookup by order ID or WhatsApp number.

## Capabilities and Constraints

- Next.js App Router web application with API routes under `src/app/api`.
- Data access uses Drizzle ORM with PostgreSQL/Supabase-style environment variables.
- Authentication uses NextAuth with Google, credentials, and OTP providers.
- Catalog, orders, payments, reviews, articles, promos, settings, and user profiles are represented in `src/lib/db/schema.ts`.
- External API access uses an `X-API-KEY` header through shared fetch utilities.
- Product facts not confirmed here should remain marked as open rather than invented.

## Brand Commitments

The confirmed product name is Feryshop. Existing copy is Indonesian-first and uses commerce terms such as `Beranda`, `Pesanan`, `Invoice`, `Promo`, and `Coba Lagi`. Existing assets include logos and promotional media in `public/`.

## Evidence on Hand

- `README.md` describes Feryshop as a top-up and marketplace account frontend.
- `src/app` contains storefront, account, invoice, marketplace, article, calculator, and API routes.
- `src/lib/db/schema.ts` defines users, categories, games, products, payment methods, orders, promo codes, reviews, articles, and settings.
- `public/` contains brand logos and static promotional assets.
- No real customer testimonials, production metrics, pricing claims, or third-party trust badges were confirmed during init.

## Product Principles

- Keep purchase flows fast, clear, and resilient when data or payment status is delayed.
- Preserve Indonesian-first terminology and customer support patterns.
- Treat payment, invoice, and order status as high-trust interactions.
- Keep member/account features connected to transaction history and API access.
- Do not fabricate proof, performance claims, or unsupported payment/provider guarantees.
