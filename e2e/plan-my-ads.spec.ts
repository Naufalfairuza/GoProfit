import {
    expect,
    test,
    type Page,
} from "@playwright/test";

async function fillBaseEconomics(
  page: Page,
  adminFee = "8",
) {
  await page
    .getByLabel("Modal / HPP")
    .fill("80000");

  await page
    .getByLabel("Harga Normal")
    .fill("150000");

  await page
    .getByLabel("Biaya Admin Marketplace")
    .fill(adminFee);

  await page
    .getByLabel("Biaya Proses Pesanan")
    .fill("1250");

  await page
    .getByLabel("Biaya Packing")
    .fill("2000");
}

async function selectTargetAmount(
  page: Page,
  amount: string,
) {
  await page
    .getByRole("button", {
      name: /Rupiah \/ order/i,
    })
    .click();

  await page
    .getByLabel("Target Profit / Order")
    .fill(amount);
}

test.describe("GOProfit - Plan My Ads", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/plan");
  });

  test("formats currency inputs correctly", async ({
    page,
  }) => {
    const hppInput =
      page.getByLabel("Modal / HPP");

    const priceInput =
      page.getByLabel("Harga Normal");

    await hppInput.fill("80000");
    await priceInput.fill("150000");

    await expect(hppInput).toHaveValue(
      "Rp80.000",
    );

    await expect(priceInput).toHaveValue(
      "Rp150.000",
    );

    const adminFeeInput = page.getByLabel("Biaya Admin Marketplace");
    await adminFeeInput.fill("8,5");
    await expect(adminFeeInput).toHaveValue("8,5");
  });

  test("includes optional Shopee program fees", async ({
    page,
  }) => {
    await fillBaseEconomics(page, "8");

    await page
      .getByRole("checkbox", { name: "Promo XTRA+" })
      .check();

    await page
      .getByRole("button", { name: "Hitung ROAS Saya" })
      .click();

    const promoCard = page
      .getByRole("checkbox", { name: "Promo XTRA+" })
      .locator("xpath=../..");
    await expect(promoCard.getByText("Promo XTRA+", { exact: true })).toBeVisible();
    await expect(promoCard.getByText("Biaya program", { exact: true })).toBeVisible();
  });

  test("calculates target ROAS baseline correctly", async ({
    page,
  }) => {
    await fillBaseEconomics(page, "8");

    await selectTargetAmount(
      page,
      "25000",
    );

    const calculateButton =
      page.getByRole("button", {
        name: "Hitung ROAS Saya",
      });

    await expect(
      calculateButton,
    ).toBeEnabled();

    await calculateButton.click();

    await expect(
      page.getByText(
        "Batas ekonomi iklanmu",
      ),
    ).toBeVisible();

    // Nilai hero Minimum ROAS Aman.
    // Elemen <p> dipakai agar tidak bentrok
    // dengan nilai Target pada ROAS zone.
    await expect(
      page
        .locator("p")
        .filter({
          hasText: /^5,04$/,
        }),
    ).toBeVisible();

    // Nilai ROAS BEP pada MetricCard.
    await expect(
      page
        .locator("p")
        .filter({
          hasText: /^2,74$/,
        }),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Rp29.750",
        {
          exact: true,
        },
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Rp54.750",
        {
          exact: true,
        },
      ),
    ).toBeVisible();
  });

  test("keeps the calculated result after visiting Learn", async ({ page }) => {
    await fillBaseEconomics(page, "8,5");
    await selectTargetAmount(page, "25000");
    await page.getByRole("button", { name: "Hitung ROAS Saya" }).click();
    await expect(page.getByText("Batas ekonomi iklanmu")).toBeVisible();

    await page.locator('a[href="/learn"]:visible').click();
    await expect(
      page.getByRole("heading", { name: "Baca angka iklan dengan konteks profit" }),
    ).toBeVisible();

    await page
      .locator(
        'nav[aria-label="Navigasi utama"] a[href="/plan"]:visible, nav[aria-label="Navigasi mobile"] a[href="/plan"]:visible',
      )
      .click();
    await expect(page.getByText("Batas ekonomi iklanmu")).toBeVisible();
    await expect(page.getByText("Perhitungan terakhir dipulihkan")).toBeVisible();
    await expect(
      page.locator(
        'nav[aria-label="Navigasi utama"] a[href="/plan"]:visible, nav[aria-label="Navigasi mobile"] a[href="/plan"]:visible',
      ),
    ).toHaveAttribute("aria-current", "page");
  });

  test("shows break-even only when target profit is not selected", async ({
    page,
  }) => {
    await fillBaseEconomics(page, "8");

    await page
      .getByRole("button", {
        name: /Saya belum tahu/i,
      })
      .click();

    await page
      .getByRole("button", {
        name: "Hitung ROAS Saya",
      })
      .click();

    await expect(
      page.getByText(
        "ROAS Impas Kamu",
      ),
    ).toBeVisible();

    await expect(
      page
        .locator("p")
        .filter({
          hasText: /^2,74$/,
        }),
    ).toBeVisible();

    // Metric "Minimum ROAS Aman" tidak boleh muncul.
    // exact:true mencegah kalimat penjelasan
    // yang kebetulan menyebut istilah tersebut
    // dianggap sebagai metric.
    await expect(
      page.getByText(
        "Minimum ROAS Aman",
        {
          exact: true,
        },
      ),
    ).not.toBeVisible();

    await expect(
      page.getByText(
        /Kamu belum menentukan target profit/i,
      ),
    ).toBeVisible();
  });

  test("shows target not feasible when requested profit exceeds contribution", async ({
    page,
  }) => {
    await fillBaseEconomics(page, "8");

    await selectTargetAmount(
      page,
      "60000",
    );

    await page
      .getByRole("button", {
        name: "Hitung ROAS Saya",
      })
      .click();

    await expect(
      page.getByText(
        "Target profit terlalu tinggi untuk kondisi saat ini",
      ),
    ).toBeVisible();

    // Metric card memakai <p>, sedangkan
    // breakdown menggunakan <span>.
    // Dengan begitu locator tetap unik.
    await expect(
      page
        .locator("p")
        .filter({
          hasText: /^Rp54\.750$/,
        }),
    ).toBeVisible();

    await expect(
      page
        .locator("p")
        .filter({
          hasText: /^Rp60\.000$/,
        }),
    ).toBeVisible();

    await expect(
      page.getByText(
        "TARGET BELUM MEMUNGKINKAN",
        {
          exact: true,
        },
      ),
    ).toBeVisible();
  });

  test("shows not ads feasible when contribution is zero", async ({
    page,
  }) => {
    await page
      .getByLabel("Modal / HPP")
      .fill("100000");

    await page
      .getByLabel("Harga Normal")
      .fill("100000");

    await page
      .getByRole("button", {
        name: /Saya belum tahu/i,
      })
      .click();

    await page
      .getByRole("button", {
        name: "Hitung ROAS Saya",
      })
      .click();

    await expect(
      page.getByText(
        "Produk belum punya ruang untuk iklan",
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        "BELUM LAYAK UNTUK ADS",
        {
          exact: true,
        },
      ),
    ).toBeVisible();
  });

  test("removes stale result after an input changes", async ({
    page,
  }) => {
    await fillBaseEconomics(page, "8");

    await selectTargetAmount(
      page,
      "25000",
    );

    await page
      .getByRole("button", {
        name: "Hitung ROAS Saya",
      })
      .click();

    await expect(
      page.getByText(
        "Batas ekonomi iklanmu",
      ),
    ).toBeVisible();

    await page
      .getByLabel("Modal / HPP")
      .fill("85000");

    await expect(
      page.getByText(
        "Batas ekonomi iklanmu",
      ),
    ).not.toBeVisible();

    await expect(
      page.getByText(
        "Yang akan kita hitung",
      ),
    ).toBeVisible();
  });

  test("supports seller-funded discount and voucher", async ({
    page,
  }) => {
    await fillBaseEconomics(page, "8");

    await page
      .getByRole("button", {
        name: /Tambahkan diskon produk/i,
      })
      .click();

    await page
      .getByLabel("Diskon Produk")
      .fill("10000");

    await page
      .getByRole("button", {
        name: /Tambahkan voucher toko/i,
      })
      .click();

    await page
      .getByLabel("Voucher Toko")
      .fill("5000");

    await selectTargetAmount(
      page,
      "25000",
    );

    await page
      .getByRole("button", {
        name: "Hitung ROAS Saya",
      })
      .click();

    await expect(
      page.getByText(
        "Rp135.000",
        {
          exact: true,
        },
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        "-Rp10.000",
        {
          exact: true,
        },
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        "-Rp5.000",
        {
          exact: true,
        },
      ),
    ).toBeVisible();
  });
});
