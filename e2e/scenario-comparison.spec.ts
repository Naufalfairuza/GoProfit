import {
    expect,
    test,
    type Locator,
    type Page,
} from "@playwright/test";

async function fillCurrentBaseline(
  page: Page,
) {
  await page
    .getByLabel("Modal / HPP")
    .fill("80000");

  await page
    .getByLabel("Harga Normal")
    .fill("150000");

  await page
    .getByLabel(
      "Biaya Admin Marketplace",
    )
    .fill("8");

  await page
    .getByLabel(
      "Biaya Proses Pesanan",
    )
    .fill("1250");

  await page
    .getByLabel("Biaya Packing")
    .fill("2000");

  await page
    .getByRole("button", {
      name: /Rupiah \/ order/i,
    })
    .click();

  await page
    .getByLabel(
      "Target Profit / Order",
    )
    .fill("25000");
}

async function calculateCurrent(
  page: Page,
) {
  await fillCurrentBaseline(page);

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

  await expect(
    page.getByText(
      "Scenario Comparison",
      {
        exact: true,
      },
    ),
  ).toBeVisible();
}

async function addScenario(
  page: Page,
) {
  await page
    .getByRole("button", {
      name: "+ Coba Skenario",
    })
    .click();
}

function scenarioEditor(
  page: Page,
  scenarioId: string,
): Locator {
  return page
    .locator("article")
    .filter({
      has: page.locator(
        `#${scenarioId}-name`,
      ),
    });
}

function comparisonCard(
  page: Page,
  scenarioName: string,
): Locator {
  return page
    .locator("article")
    .filter({
      has: page.getByRole(
        "heading",
        {
          name: scenarioName,
          exact: true,
        },
      ),
    });
}

function comparisonValue(
  card: Locator,
  label: string,
): Locator {
  return card
    .getByText(
      label,
      {
        exact: true,
      },
    )
    .locator("..")
    .locator("span")
    .nth(1);
}

test.describe(
  "GOProfit - Scenario Comparison",
  () => {
    test.beforeEach(
      async ({ page }) => {
        await page.goto("/plan");

        await calculateCurrent(
          page,
        );
      },
    );

    test(
      "clones Current and keeps scenario isolated",
      async ({ page }) => {
        await addScenario(page);

        const editor =
          scenarioEditor(
            page,
            "scenario-1",
          );

        await expect(
          editor.getByLabel(
            "Harga Normal",
          ),
        ).toHaveValue(
          "Rp150.000",
        );

        await expect(
          editor.getByLabel(
            "Modal / HPP",
          ),
        ).toHaveValue(
          "Rp80.000",
        );

        await expect(
          editor.getByLabel(
            "Biaya Admin",
          ),
        ).toHaveValue("8");

        await expect(
          editor.getByLabel(
            "Biaya Proses",
          ),
        ).toHaveValue(
          "Rp1.250",
        );

        await expect(
          editor.getByLabel(
            "Biaya Packing",
          ),
        ).toHaveValue(
          "Rp2.000",
        );

        await editor
          .getByLabel(
            "Harga Normal",
          )
          .fill("160000");

        await expect(
          editor.getByText(
            "Perubahan belum dihitung",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await editor
          .getByRole("button", {
            name:
              "Hitung Skenario",
          })
          .click();

        await expect(
          editor.getByText(
            "Hasil sudah diperbarui",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        const current =
          comparisonCard(
            page,
            "Current",
          );

        const scenario =
          comparisonCard(
            page,
            "Scenario A",
          );

        await expect(
          comparisonValue(
            current,
            "Harga",
          ),
        ).toHaveText(
          "Rp150.000",
        );

        await expect(
          comparisonValue(
            current,
            "Profit sebelum iklan",
          ),
        ).toHaveText(
          "Rp54.750",
        );

        await expect(
          comparisonValue(
            current,
            "ROAS BEP",
          ),
        ).toHaveText(
          "2,74",
        );

        await expect(
          comparisonValue(
            current,
            "Target ROAS",
          ),
        ).toHaveText(
          "5,04",
        );

        await expect(
          comparisonValue(
            scenario,
            "Harga",
          ),
        ).toHaveText(
          "Rp160.000",
        );

        await expect(
          comparisonValue(
            scenario,
            "Profit sebelum iklan",
          ),
        ).toHaveText(
          "Rp63.950",
        );

        await expect(
          comparisonValue(
            scenario,
            "ROAS BEP",
          ),
        ).toHaveText(
          "2,50",
        );

        await expect(
          comparisonValue(
            scenario,
            "Target ROAS",
          ),
        ).toHaveText(
          "4,11",
        );

        await expect(
          scenario.getByText(
            "PROFIT TERBESAR",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await expect(
          page
            .getByLabel(
              "Harga Normal",
            )
            .first(),
        ).toHaveValue(
          "Rp150.000",
        );
      },
    );

    test(
      "supports scenario discount, voucher, and different target profit",
      async ({ page }) => {
        await addScenario(page);

        const editor =
          scenarioEditor(
            page,
            "scenario-1",
          );

        await editor
          .getByLabel(
            "Harga Normal",
          )
          .fill("160000");

        await editor
          .getByLabel(
            "Target Profit / Order",
          )
          .fill("30000");

        await editor
          .getByRole("button", {
            name:
              /Tambahkan diskon produk/i,
          })
          .click();

        await editor
          .getByLabel(
            "Diskon Produk",
          )
          .fill("10000");

        await editor
          .getByRole("button", {
            name:
              /Tambahkan voucher toko/i,
          })
          .click();

        await editor
          .getByLabel(
            "Voucher Toko",
          )
          .fill("5000");

        await editor
          .getByRole("button", {
            name:
              "Hitung Skenario",
          })
          .click();

        const current =
          comparisonCard(
            page,
            "Current",
          );

        const scenario =
          comparisonCard(
            page,
            "Scenario A",
          );

        await expect(
          comparisonValue(
            current,
            "Harga",
          ),
        ).toHaveText(
          "Rp150.000",
        );

        await expect(
          comparisonValue(
            current,
            "Target Profit",
          ),
        ).toHaveText(
          "Rp25.000 / order",
        );

        await expect(
          comparisonValue(
            scenario,
            "Harga",
          ),
        ).toHaveText(
          "Rp160.000",
        );

        await expect(
          comparisonValue(
            scenario,
            "Harga efektif",
          ),
        ).toHaveText(
          "Rp145.000",
        );

        await expect(
          comparisonValue(
            scenario,
            "Target Profit",
          ),
        ).toHaveText(
          "Rp30.000 / order",
        );

        await expect(
          page
            .getByLabel(
              "Harga Normal",
            )
            .first(),
        ).toHaveValue(
          "Rp150.000",
        );

        await expect(
          page
            .getByLabel(
              "Target Profit / Order",
            )
            .first(),
        ).toHaveValue(
          "Rp25.000",
        );
      },
    );

    test(
      "can rename collapse and reopen a scenario",
      async ({ page }) => {
        await addScenario(page);

        let editor =
          scenarioEditor(
            page,
            "scenario-1",
          );

        const nameInput =
          editor.getByLabel(
            "Nama Scenario",
          );

        await nameInput.fill(
          "Harga 160K",
        );

        await nameInput.blur();

        editor =
          scenarioEditor(
            page,
            "scenario-1",
          );

        await editor
          .getByLabel(
            "Harga Normal",
          )
          .fill("160000");

        await editor
          .getByRole("button", {
            name:
              "Hitung Skenario",
          })
          .click();

        await expect(
          comparisonCard(
            page,
            "Harga 160K",
          ),
        ).toBeVisible();

        await editor
          .getByRole("button", {
            name: "Tutup",
          })
          .click();

        await expect(
          editor.getByText(
            "Profit sebelum iklan",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await expect(
          editor.getByText(
            "Rp63.950",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await expect(
          editor.getByRole(
            "button",
            {
              name: "Buka",
            },
          ),
        ).toBeVisible();

        await expect(
          editor.getByLabel(
            "Harga Normal",
          ),
        ).not.toBeVisible();

        await editor
          .getByRole("button", {
            name: "Buka",
          })
          .click();

        await expect(
          editor.getByLabel(
            "Harga Normal",
          ),
        ).toHaveValue(
          "Rp160.000",
        );
      },
    );

    test(
      "reset restores Current values but preserves custom name",
      async ({ page }) => {
        await addScenario(page);

        let editor =
          scenarioEditor(
            page,
            "scenario-1",
          );

        const nameInput =
          editor.getByLabel(
            "Nama Scenario",
          );

        await nameInput.fill(
          "Tes Harga",
        );

        await nameInput.blur();

        editor =
          scenarioEditor(
            page,
            "scenario-1",
          );

        await editor
          .getByLabel(
            "Harga Normal",
          )
          .fill("175000");

        await editor
          .getByLabel(
            "Biaya Admin",
          )
          .fill("10");

        await editor
          .getByLabel(
            "Target Profit / Order",
          )
          .fill("35000");

        await editor
          .getByRole("button", {
            name:
              /Tambahkan diskon produk/i,
          })
          .click();

        await editor
          .getByLabel(
            "Diskon Produk",
          )
          .fill("10000");

        await editor
          .getByRole("button", {
            name:
              "Hitung Skenario",
          })
          .click();

        await editor
          .getByRole("button", {
            name:
              "Reset ke Current",
          })
          .click();

        editor =
          scenarioEditor(
            page,
            "scenario-1",
          );

        await expect(
          editor.getByLabel(
            "Nama Scenario",
          ),
        ).toHaveValue(
          "Tes Harga",
        );

        await expect(
          editor.getByLabel(
            "Harga Normal",
          ),
        ).toHaveValue(
          "Rp150.000",
        );

        await expect(
          editor.getByLabel(
            "Modal / HPP",
          ),
        ).toHaveValue(
          "Rp80.000",
        );

        await expect(
          editor.getByLabel(
            "Biaya Admin",
          ),
        ).toHaveValue("8");

        await expect(
          editor.getByLabel(
            "Biaya Proses",
          ),
        ).toHaveValue(
          "Rp1.250",
        );

        await expect(
          editor.getByLabel(
            "Biaya Packing",
          ),
        ).toHaveValue(
          "Rp2.000",
        );

        await expect(
          editor.getByLabel(
            "Target Profit / Order",
          ),
        ).toHaveValue(
          "Rp25.000",
        );

        await expect(
          editor.getByLabel(
            "Diskon Produk",
          ),
        ).not.toBeVisible();

        await expect(
          editor.getByText(
            "Hasil sudah diperbarui",
            {
              exact: true,
            },
          ),
        ).toBeVisible();
      },
    );

    test(
      "limits scenarios to three and safely reuses deleted slot",
      async ({ page }) => {
        const addButton =
          page.getByRole(
            "button",
            {
              name:
                "+ Coba Skenario",
            },
          );

        await addButton.click();
        await addButton.click();
        await addButton.click();

        await expect(
          page.locator(
            "#scenario-1-name",
          ),
        ).toHaveValue(
          "Scenario A",
        );

        await expect(
          page.locator(
            "#scenario-2-name",
          ),
        ).toHaveValue(
          "Scenario B",
        );

        await expect(
          page.locator(
            "#scenario-3-name",
          ),
        ).toHaveValue(
          "Scenario C",
        );

        await expect(
          addButton,
        ).toBeDisabled();

        await expect(
          page.getByText(
            /Maksimal tiga scenario/i,
          ),
        ).toBeVisible();

        const scenarioB =
          scenarioEditor(
            page,
            "scenario-2",
          );

        await scenarioB
          .getByRole("button", {
            name: "Hapus",
          })
          .click();

        await expect(
          page.locator(
            "#scenario-2-name",
          ),
        ).toHaveCount(0);

        await expect(
          addButton,
        ).toBeEnabled();

        await addButton.click();

        await expect(
          page.locator(
            "#scenario-2-name",
          ),
        ).toHaveValue(
          "Scenario B",
        );

        await expect(
          page.getByLabel(
            "Nama Scenario",
          ),
        ).toHaveCount(3);

        await expect(
          addButton,
        ).toBeDisabled();
      },
    );

    test(
      "does not replace calculated comparison with dirty scenario values",
      async ({ page }) => {
        await addScenario(page);

        const editor =
          scenarioEditor(
            page,
            "scenario-1",
          );

        await editor
          .getByLabel(
            "Harga Normal",
          )
          .fill("160000");

        await editor
          .getByRole("button", {
            name:
              "Hitung Skenario",
          })
          .click();

        await expect(
          comparisonValue(
            comparisonCard(
              page,
              "Scenario A",
            ),
            "Harga",
          ),
        ).toHaveText(
          "Rp160.000",
        );

        await editor
          .getByLabel(
            "Harga Normal",
          )
          .fill("170000");

        await expect(
          editor.getByText(
            "Perubahan belum dihitung",
            {
              exact: true,
            },
          ),
        ).toBeVisible();

        await expect(
          comparisonCard(
            page,
            "Scenario A",
          ),
        ).not.toBeVisible();

        await expect(
          page.getByText(
            /Ada perubahan scenario yang belum dihitung/i,
          ),
        ).toBeVisible();

        await expect(
          comparisonCard(
            page,
            "Current",
          ),
        ).toBeVisible();

        await editor
          .getByRole("button", {
            name:
              "Hitung Skenario",
          })
          .click();

        await expect(
          comparisonValue(
            comparisonCard(
              page,
              "Scenario A",
            ),
            "Harga",
          ),
        ).toHaveText(
          "Rp170.000",
        );
      },
    );
  },
);