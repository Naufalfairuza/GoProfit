import { expect, test } from "@playwright/test";

test.describe("GOProfit - Check and Saved", () => {
  test("analyzes a campaign and saves the result locally", async ({ page }) => {
    await page.goto("/check");

    await page.getByLabel("Modal / HPP").fill("80000");
    await page.getByLabel("Harga Normal").fill("150000");
    await page.getByLabel("Biaya Admin Marketplace").fill("8");
    await page.getByLabel("Biaya Proses Pesanan").fill("1250");
    await page.getByLabel("Biaya Packing").fill("2000");
    await page.getByLabel("Ad Spend").fill("100000");
    await page.getByLabel("GMV dari Ads").fill("750000");
    await page.locator("#check-orders").fill("5");
    await page.locator("#check-units-sold").fill("5");

    await page.getByRole("button", { name: "Analisis Iklan Saya" }).click();

    await expect(page.getByText("Estimated Profit After Ads").first()).toBeVisible();
    await expect(page.getByText("Economic ROAS").first()).toBeVisible();

    await page.getByRole("button", { name: "Simpan perhitungan" }).click();
    await page.getByLabel("Nama perhitungan").fill("Campaign minggu ini");
    await page.getByRole("button", { name: "Simpan", exact: true }).click();

    await expect(page.getByText("Perhitungan tersimpan di browser ini.")).toBeVisible();

    await page.goto("/saved");
    await expect(page.getByRole("heading", { name: "Campaign minggu ini" })).toBeVisible();
    await expect(page.locator("article").getByText("Check My Ads")).toBeVisible();

    await page.getByRole("link", { name: /Buka & restore/i }).click();
    await expect(page).toHaveURL(/\/check\?restore=/);
    await expect(page.getByLabel("Ad Spend")).toHaveValue("Rp100.000");
    await expect(page.getByLabel("GMV dari Ads")).toHaveValue("Rp750.000");
  });

  test("explains the core formulas on Learn", async ({ page }) => {
    await page.goto("/learn");

    await expect(
      page.getByRole("heading", { name: "Baca angka iklan dengan konteks profit" }),
    ).toBeVisible();
    await expect(page.getByText("ROAS BEP = Harga efektif ÷ Contribution sebelum iklan")).toBeVisible();
    await expect(page.getByText("Catatan untuk Shopee")).toBeVisible();
  });

  test("keeps the analysis after visiting Learn and supports reset", async ({ page }) => {
    await page.goto("/check");

    await page.getByLabel("Modal / HPP").fill("80000");
    await page.getByLabel("Harga Normal").fill("150000");
    await page.getByLabel("Biaya Admin Marketplace").fill("8,5");
    await page.getByLabel("Biaya Proses Pesanan").fill("1250");
    await page.getByLabel("Ad Spend").fill("100000");
    await page.getByLabel("GMV dari Ads").fill("750000");
    await page.locator("#check-orders").fill("5");
    await page.locator("#check-units-sold").fill("5");

    await page.getByRole("button", { name: "Analisis Iklan Saya" }).click();
    await expect(page.getByText("Estimated Profit After Ads").first()).toBeVisible();

    await page.locator('a[href="/learn"]:visible').click();
    await expect(
      page.getByRole("heading", { name: "Baca angka iklan dengan konteks profit" }),
    ).toBeVisible();

    await page
      .locator(
        'nav[aria-label="Navigasi utama"] a[href="/check"]:visible, nav[aria-label="Navigasi mobile"] a[href="/check"]:visible',
      )
      .click();
    await expect(page.getByText("Estimated Profit After Ads").first()).toBeVisible();
    await expect(page.getByText("Analisis terakhir dipulihkan")).toBeVisible();
    await expect(
      page.locator(
        'nav[aria-label="Navigasi utama"] a[href="/check"]:visible, nav[aria-label="Navigasi mobile"] a[href="/check"]:visible',
      ),
    ).toHaveAttribute("aria-current", "page");

    await page.getByRole("button", { name: "Mulai ulang" }).click();
    await expect(page.getByText("ROAS saja belum cukup")).toBeVisible();
  });

  test("uses Live-attributed orders for Shopee Live XTRA", async ({ page }) => {
    await page.goto("/check");

    await page.getByLabel("Modal / HPP").fill("80000");
    await page.getByLabel("Harga Normal").fill("150000");
    await page.getByLabel("Biaya Admin Marketplace").fill("8");
    await page.getByLabel("Biaya Proses Pesanan").fill("1250");
    await page.getByLabel("Biaya Packing").fill("2000");
    await page.getByRole("checkbox", { name: "Shopee Live XTRA" }).check();

    await expect(page.getByLabel("Biaya program")).toHaveValue("3");
    await expect(page.getByLabel("Batas / unit (opsional)")).toHaveValue("Rp20.000");

    await page.getByLabel("Ad Spend").fill("100000");
    await page.getByLabel("GMV dari Ads").fill("750000");
    await page.locator("#check-orders").fill("5");
    await page.locator("#check-units-sold").fill("5");
    await page.getByLabel("Orders dari Shopee Live").fill("2");
    await page.getByLabel("Units dari Shopee Live").fill("2");

    await page.getByRole("button", { name: "Analisis Iklan Saya" }).click();
    await expect(page.getByText("Estimated Profit After Ads").first()).toBeVisible();
  });
});
