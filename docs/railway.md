# Railway Deployment

This app is configured for Railway with `railway.json`.

## Root Domain

FS-Public is the public storefront and should be served directly from the root
domain.

Do not set `NEXT_PUBLIC_BASE_PATH` for the primary production storefront.

Expected routes:

```text
/
/order/mobile-legends
/invoices
```

Attach the custom root or apex domain to the Railway service that uses
`FS-Public` as its root directory.

## Admin Path

To serve `game-inventori` at `/admin` on the same public domain, deploy it as a
separate Railway service and set this variable on the `FS-Public` service:

```text
ADMIN_DASHBOARD_ORIGIN=https://your-game-inventori-service.up.railway.app
```

The storefront rewrites these paths to the admin service:

```text
/admin
/admin/*
```

The `game-inventori` service is configured to serve itself from `/admin`, so its
assets and API routes stay under the same path.

## Optional Route Prefix

Only set a prefix for a non-primary deployment, preview, or special routed setup:

```text
NEXT_PUBLIC_BASE_PATH=/store
```

`NEXT_PUBLIC_BASE_PATH` is a build-time Next.js value, so changing it requires a new deployment.

## API Compatibility

Client and server calls that use local API routes should go through `apiPath()` or the
shared `fetcher()` so the request path includes `NEXT_PUBLIC_BASE_PATH` when it is
enabled.

Railway checks:

```text
/api/health
```
