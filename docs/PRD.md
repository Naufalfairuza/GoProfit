# GOProfit — Product Requirements Document

## Status

MVP development document, reconstructed from the current codebase.

## Product goal

GOProfit membantu seller marketplace menjawab dua pertanyaan sebelum dan
sesudah beriklan:

1. Berapa ROAS minimum agar produk tidak rugi dan tetap mencapai target profit?
2. Apakah campaign yang sudah berjalan benar-benar menghasilkan profit setelah
   HPP, fee marketplace, biaya operasional, dan total biaya iklan?

Platform pertama yang didukung adalah Shopee Indonesia dengan biaya marketplace
yang dimasukkan seller berdasarkan rincian toko/programnya sendiri.

## Target user

- Seller kecil dan menengah yang menjual produk fisik di marketplace.
- Seller yang sudah melihat ROAS di dashboard iklan, tetapi belum punya cara
  cepat untuk menghubungkannya ke profit per order.

## MVP scope

### Plan My Ads

- Input harga normal dan HPP/modal per unit.
- Input diskon produk dan voucher seller.
- Input biaya admin marketplace (%), biaya proses per order, dan biaya packing.
- Pilihan program Shopee yang ditanggung seller: Gratis Ongkir XTRA, Shopee
  Live XTRA, Promo XTRA, dan Promo XTRA+. Setiap program dapat diaktifkan,
  diisi persentasenya, dan diberi batas biaya per unit bila berlaku.
- Target profit dalam Rupiah/order, net margin, atau markup HPP.
- Output profit sebelum iklan, ROAS BEP, BEP ACOS, max ads/order, dan minimum
  ROAS aman.
- Status hasil: belum layak ads, target belum memungkinkan, break-even only,
  atau target feasible.
- Perbandingan sampai tiga skenario tanpa mengubah perhitungan utama.

### Check My Ads

- Input ekonomi produk yang sama dengan produk pada campaign.
- Input ad spend, GMV dari Ads, orders, units sold, clicks opsional, dan biaya
  iklan tambahan.
- Jika Shopee Live XTRA aktif, input orders dan units yang teratribusi dari
  Shopee Live agar biaya Live tidak dibebankan ke semua order campaign.
- Output reported ROAS, Economic ROAS, reported/economic ACOS, CPA, CPC,
  estimated profit after ads, profit/order, diagnosis, dan warning scope data.

### Supporting MVP

- Menyimpan snapshot perhitungan di localStorage browser tanpa login.
- Membuka kembali snapshot Saved ke form Plan atau Check melalui fitur restore.
- Halaman Learn untuk menjelaskan formula dan batasan interpretasi.
- Responsive layout untuk desktop dan mobile.

## Formula inti

- Harga efektif = harga normal − diskon produk − voucher/potongan seller.
- Contribution sebelum iklan = harga efektif − HPP − marketplace fee − biaya
  operasional.
- Fee program persentase = basis fee × rate; jika ada cap per unit, fee dibatasi
  oleh cap × jumlah unit.
- Shopee Live XTRA memakai basis penjualan yang teratribusi Live, dengan
  referensi 3% atau 2% jika Promo XTRA/XTRA+ aktif, maksimal Rp20.000/unit.
- ROAS BEP = harga efektif ÷ contribution sebelum iklan.
- Minimum ROAS aman = harga efektif ÷ (contribution sebelum iklan − target profit).
- Reported ROAS = GMV dari Ads ÷ media ad spend.
- Economic ROAS = GMV dari Ads ÷ (media ad spend + biaya iklan tambahan).
- Estimated profit after ads = contribution sebelum iklan − total biaya iklan.

Semua nominal disimpan sebagai integer Rupiah. Fee persentase disimpan sebagai
basis points untuk menghindari error floating point pada input.

## Prinsip produk

- Tidak ada asumsi fee marketplace tersembunyi.
- ROAS tidak diperlakukan sebagai sinonim profit.
- Scope data harus terlihat: per unit, per order, dan per campaign.
- Hasil diberi label estimasi jika GMV berasal dari atribusi marketplace.
- Angka yang tidak bisa dihitung ditampilkan sebagai unavailable, bukan dipaksa
  menjadi nol.

## Non-goals MVP

- Sinkronisasi API marketplace.
- Tarif Shopee universal yang berlaku untuk semua kategori/program seller.
- Akuntansi resmi, laporan pajak, atau rekonsiliasi payout.
- Multi-user account dan cloud sync.
- Optimasi bid atau automated campaign management.

## Next milestones

1. Tambahkan preset fee versioned setelah sumber, effective date, basis,
   eligibility, cap, dan rounding tiap fee diverifikasi. Program Gratis Ongkir
   XTRA dan Live XTRA tetap meminta input manual sampai tarif seller dapat
   dipastikan.
2. Tambahkan platform adapter untuk Tokopedia/TikTok Shop dengan aturan fee
   terpisah.
3. Tambahkan export snapshot ke CSV/PDF setelah model data stabil.
