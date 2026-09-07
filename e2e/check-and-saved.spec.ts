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
    await page.getByLabel("Orders").fill("5");
    await page.getByLabel("Units Sold").fill("5");

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
  });

  test("explains the core formulas on Learn", async ({ page }) => {
    await page.goto("/learn");

    await expect(
      page.getByRole("heading", { name: "Baca angka iklan dengan konteks profit" }),
    ).toBeVisible();
    await expect(page.getByText("ROAS BEP = Harga efektif ÷ Contribution sebelum iklan")).toBeVisible();
    await expect(page.getByText("Catatan untuk Shopee")).toBeVisible();
  });
});
