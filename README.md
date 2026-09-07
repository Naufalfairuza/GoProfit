# GOProfit

GOProfit adalah kalkulator ekonomi iklan untuk seller marketplace. MVP saat ini
fokus pada Shopee Indonesia dan menyediakan Plan My Ads untuk menghitung ROAS
aman serta Check My Ads untuk mengecek profit campaign setelah HPP, fee, dan
biaya iklan.

Fee marketplace dan program Shopee dapat berbeda menurut kategori, program,
dan kondisi seller. GOProfit menyediakan referensi awal untuk Promo XTRA dan
Promo XTRA+, serta referensi 3%/2% dan cap untuk Shopee Live XTRA. Gratis
Ongkir XTRA tetap meminta tarif kategori secara manual. Selalu cocokkan angka
dengan rincian biaya dan atribusi penjualan di Seller Centre.

Dokumentasi produk ada di [`docs/PRD.md`](docs/PRD.md) dan model data di
[`docs/ERD.md`](docs/ERD.md).

## Menjalankan project

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

Useful checks:

```bash
npm run typecheck
npm run test:run
npm run e2e
```

The main application routes are `/plan`, `/check`, `/saved`, and `/learn`.
Saved calculations can be opened with **Buka & restore** to return their input
to the relevant calculator.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
