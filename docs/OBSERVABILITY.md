# Observability

GOProfit uses Vercel Web Analytics for anonymized page-view analytics and
Sentry for optional client/server error monitoring.

## Vercel Web Analytics

1. Open the GOProfit project in Vercel.
2. Open **Analytics** and click **Enable**.
3. Push this code to GitHub so Vercel creates a new deployment.

The application renders `Analytics` from `@vercel/analytics/next` in the root
layout. Do not send calculator inputs, campaign values, or saved calculation
contents as analytics event properties.

## Sentry

Create a Next.js project at Sentry, then add the same DSN to the Vercel project
in both **Production** and **Preview** environments:

```text
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

The app is intentionally disabled when these variables are absent, so local
development and deployments without Sentry credentials continue to work.
The configuration samples 10% of performance traces and does not enable
session replay.

## Feedback pengguna

Tombol `Laporkan masalah` mengirim feedback secara langsung ke Sentry melalui
`captureFeedback`. Data yang dikirim hanya pesan, kategori, halaman, dan email
kontak jika pengguna memilih mengisinya. Form tidak mengirim nilai input
kalkulator secara otomatis. Jangan meminta pengguna menulis password, token,
atau data sensitif toko di kolom feedback.
