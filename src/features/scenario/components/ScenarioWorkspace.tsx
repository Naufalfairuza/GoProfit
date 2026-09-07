"use client";

import { useState } from "react";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";

import {
    planAds,
    validatePlanInput,
} from "@/core/calculation";

import type {
    PlanAdsInput,
    PlanAdsResult,
} from "@/domain/types";

import {
    buildScenarioInput,
    clonePlanInput,
    createScenarioDraft,
} from "../scenario.helpers";

import type {
    ScenarioDraft,
    ScenarioItem,
    ScenarioTargetProfitMode,
} from "../types";

interface ScenarioWorkspaceProps {
  baseInput: PlanAdsInput;
  baseResult: PlanAdsResult;
}

export function ScenarioWorkspace({
  baseInput,
  baseResult,
}: ScenarioWorkspaceProps) {
  const [scenarios, setScenarios] =
    useState<ScenarioItem[]>([]);

  const maxScenarios = 3;
  const reachedLimit =
    scenarios.length >= maxScenarios;

  function addScenario() {
    if (reachedLimit) {
      return;
    }

    const number =
      findNextScenarioNumber(
        scenarios,
      );

    const draft =
      createScenarioDraft(
        baseInput,
        number,
      );

    setScenarios((current) => [
      ...current,
      {
        draft,
        input:
          clonePlanInput(
            baseInput,
          ),
        result:
          baseResult,
        dirty:
          false,
        error:
          null,
      },
    ]);
  }

  function updateScenario(
    id: string,
    patch:
      Partial<ScenarioDraft>,
  ) {
    setScenarios((current) =>
      current.map(
        (scenario) => {
          if (
            scenario.draft.id !== id
          ) {
            return scenario;
          }

          return {
            ...scenario,

            draft: {
              ...scenario.draft,
              ...patch,
            },

            dirty:
              true,

            error:
              null,
          };
        },
      ),
    );
  }

  function renameScenario(
    id: string,
    name: string,
  ) {
    setScenarios((current) =>
      current.map(
        (scenario) => {
          if (
            scenario.draft.id !== id
          ) {
            return scenario;
          }

          return {
            ...scenario,

            draft: {
              ...scenario.draft,
              name:
                name.slice(
                  0,
                  40,
                ),
            },
          };
        },
      ),
    );
  }

  function normalizeScenarioName(
    id: string,
  ) {
    setScenarios((current) =>
      current.map(
        (scenario) => {
          if (
            scenario.draft.id !== id
          ) {
            return scenario;
          }

          const trimmed =
            scenario.draft.name.trim();

          if (trimmed) {
            return {
              ...scenario,

              draft: {
                ...scenario.draft,
                name:
                  trimmed,
              },
            };
          }

          return {
            ...scenario,

            draft: {
              ...scenario.draft,
              name:
                getDefaultScenarioName(
                  scenario.draft.id,
                ),
            },
          };
        },
      ),
    );
  }

  function calculateScenario(
    id: string,
  ) {
    setScenarios((current) =>
      current.map(
        (scenario) => {
          if (
            scenario.draft.id !== id
          ) {
            return scenario;
          }

          const input =
            buildScenarioInput(
              baseInput,
              scenario.draft,
            );

          if (!input) {
            return {
              ...scenario,

              error:
                "Lengkapi harga, HPP, dan nilai Target Profit yang kamu pilih.",

              dirty:
                true,
            };
          }

          const validation =
            validatePlanInput(
              input,
            );

          if (
            !validation.valid
          ) {
            return {
              ...scenario,

              error:
                getScenarioValidationMessage(
                  validation
                    .issues[0]
                    .code,
                ),

              dirty:
                true,
            };
          }

          return {
            ...scenario,

            input,

            result:
              planAds(
                input,
              ),

            dirty:
              false,

            error:
              null,
          };
        },
      ),
    );
  }

  function resetScenario(
    id: string,
  ) {
    setScenarios((current) =>
      current.map(
        (scenario) => {
          if (
            scenario.draft.id !== id
          ) {
            return scenario;
          }

          const number =
            getScenarioNumber(
              scenario.draft.id,
            );

          const freshDraft =
            createScenarioDraft(
              baseInput,
              number,
            );

          return {
            draft: {
              ...freshDraft,

              name:
                scenario.draft
                  .name,
            },

            input:
              clonePlanInput(
                baseInput,
              ),

            result:
              baseResult,

            dirty:
              false,

            error:
              null,
          };
        },
      ),
    );
  }

  function removeScenario(
    id: string,
  ) {
    setScenarios((current) =>
      current.filter(
        (scenario) =>
          scenario.draft.id !== id,
      ),
    );
  }

  return (
    <section className="mx-auto mt-8 max-w-[1180px] px-4 pb-14 md:px-6">
      <div className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--gp-border)] pb-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
              Scenario Comparison
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">
              Coba angka lain tanpa mengubah hasil utama
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--gp-text-secondary)]">
              Clone perhitungan saat ini,
              ubah harga, biaya, potongan,
              atau target profit, lalu
              bandingkan dampaknya.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={
                addScenario
              }
              disabled={
                reachedLimit
              }
              className={[
                "min-h-11 rounded-[var(--gp-radius-button)] px-5 text-sm font-bold transition",
                !reachedLimit
                  ? "bg-[var(--gp-brand-primary)] text-white hover:bg-[var(--gp-brand-hover)]"
                  : "cursor-not-allowed bg-[var(--gp-border)] text-[var(--gp-text-muted)]",
              ].join(" ")}
            >
              + Coba Skenario
            </button>

            <p className="mt-2 text-center text-[10px] text-[var(--gp-text-muted)]">
              {scenarios.length}/
              {maxScenarios} scenario
            </p>
          </div>
        </div>

        {scenarios.length ===
        0 ? (
          <ScenarioEmptyState />
        ) : (
          <>
            {reachedLimit && (
              <div className="mt-5 rounded-xl bg-[var(--gp-brand-soft)] px-4 py-3">
                <p className="text-xs leading-5 text-[var(--gp-text-secondary)]">
                  Maksimal tiga
                  scenario dapat
                  dibandingkan
                  sekaligus. Hapus
                  salah satu jika
                  ingin membuat
                  scenario baru.
                </p>
              </div>
            )}

            <div className="mt-6 space-y-5">
              {scenarios.map(
                (
                  scenario,
                ) => (
                  <ScenarioEditor
                    key={
                      scenario
                        .draft.id
                    }
                    scenario={
                      scenario
                    }
                    onChange={
                      updateScenario
                    }
                    onRename={
                      renameScenario
                    }
                    onNormalizeName={
                      normalizeScenarioName
                    }
                    onCalculate={
                      calculateScenario
                    }
                    onReset={
                      resetScenario
                    }
                    onRemove={
                      removeScenario
                    }
                  />
                ),
              )}
            </div>

            <ScenarioComparison
              baseInput={
                baseInput
              }
              baseResult={
                baseResult
              }
              scenarios={
                scenarios
              }
            />
          </>
        )}
      </div>
    </section>
  );
}

function ScenarioEditor({
  scenario,
  onChange,
  onRename,
  onNormalizeName,
  onCalculate,
  onReset,
  onRemove,
}: {
  scenario: ScenarioItem;

  onChange: (
    id: string,
    patch:
      Partial<ScenarioDraft>,
  ) => void;

  onRename: (
    id: string,
    name: string,
  ) => void;

  onNormalizeName: (
    id: string,
  ) => void;

  onCalculate: (
    id: string,
  ) => void;

  onReset: (
    id: string,
  ) => void;

  onRemove: (
    id: string,
  ) => void;
}) {
  const { draft } =
    scenario;

  const [
    collapsed,
    setCollapsed,
  ] =
    useState(false);

  function changeTargetMode(
    mode:
      ScenarioTargetProfitMode,
  ) {
    onChange(
      draft.id,
      {
        targetMode:
          mode,
      },
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)]">
      <div className="p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`${draft.id}-name`}
              className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--gp-text-muted)]"
            >
              Nama Scenario
            </label>

            <input
              id={`${draft.id}-name`}
              type="text"
              maxLength={40}
              value={
                draft.name
              }
              onChange={(
                event,
              ) =>
                onRename(
                  draft.id,
                  event.target
                    .value,
                )
              }
              onBlur={() =>
                onNormalizeName(
                  draft.id,
                )
              }
              className="mt-1 block w-full max-w-sm rounded-lg border border-transparent bg-transparent px-0 py-1 text-lg font-bold text-[var(--gp-text-primary)] outline-none transition focus:border-[var(--gp-border)] focus:bg-white focus:px-3"
            />

            <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
              Semua nilai awal
              dicopy dari Current.
              Perubahan di sini
              tidak mengubah
              perhitungan utama.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onReset(
                  draft.id,
                )
              }
              className="rounded-lg border border-[var(--gp-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--gp-text-secondary)] transition hover:text-[var(--gp-text-primary)]"
            >
              Reset ke Current
            </button>

            <button
              type="button"
              onClick={() =>
                setCollapsed(
                  (current) =>
                    !current,
                )
              }
              className="rounded-lg border border-[var(--gp-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--gp-text-secondary)] transition hover:text-[var(--gp-text-primary)]"
            >
              {collapsed
                ? "Buka"
                : "Tutup"}
            </button>

            <button
              type="button"
              onClick={() =>
                onRemove(
                  draft.id,
                )
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-[var(--gp-danger)] transition hover:bg-[var(--gp-danger-soft)]"
            >
              Hapus
            </button>
          </div>
        </div>

        {collapsed ? (
          <ScenarioCollapsedSummary
            scenario={
              scenario
            }
          />
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CurrencyInput
                id={`${draft.id}-price`}
                label="Harga Normal"
                value={
                  draft.listPrice
                }
                onValueChange={(
                  value,
                ) =>
                  onChange(
                    draft.id,
                    {
                      listPrice:
                        value,
                    },
                  )
                }
              />

              <CurrencyInput
                id={`${draft.id}-hpp`}
                label="Modal / HPP"
                value={
                  draft.hppPerUnit
                }
                onValueChange={(
                  value,
                ) =>
                  onChange(
                    draft.id,
                    {
                      hppPerUnit:
                        value,
                    },
                  )
                }
              />

              <PercentageInput
                id={`${draft.id}-admin`}
                label="Biaya Admin"
                valueBps={
                  draft.adminFeeBps
                }
                onValueChange={(
                  value,
                ) =>
                  onChange(
                    draft.id,
                    {
                      adminFeeBps:
                        value,
                    },
                  )
                }
              />

              <CurrencyInput
                id={`${draft.id}-process`}
                label="Biaya Proses"
                value={
                  draft.processFee
                }
                onValueChange={(
                  value,
                ) =>
                  onChange(
                    draft.id,
                    {
                      processFee:
                        value,
                    },
                  )
                }
              />

              <CurrencyInput
                id={`${draft.id}-packing`}
                label="Biaya Packing"
                value={
                  draft.packingCost
                }
                onValueChange={(
                  value,
                ) =>
                  onChange(
                    draft.id,
                    {
                      packingCost:
                        value,
                    },
                  )
                }
              />
            </div>

            <div className="mt-6 border-t border-[var(--gp-border)] pt-5">
              <p className="text-sm font-bold">
                Potongan Seller
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
                Potongan ini hanya
                memengaruhi Scenario,
                bukan Current.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {!draft.showDiscount ? (
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        draft.id,
                        {
                          showDiscount:
                            true,
                        },
                      )
                    }
                    className="rounded-xl border border-dashed border-[var(--gp-border)] bg-white p-4 text-left text-sm font-semibold text-[var(--gp-brand-primary)] transition hover:border-[var(--gp-brand-primary)]"
                  >
                    + Tambahkan diskon produk
                  </button>
                ) : (
                  <div className="rounded-xl border border-[var(--gp-border)] bg-white p-4">
                    <CurrencyInput
                      id={`${draft.id}-discount`}
                      label="Diskon Produk"
                      value={
                        draft.discount
                      }
                      onValueChange={(
                        value,
                      ) =>
                        onChange(
                          draft.id,
                          {
                            discount:
                              value,
                          },
                        )
                      }
                      placeholder="Rp10.000"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        onChange(
                          draft.id,
                          {
                            showDiscount:
                              false,

                            discount:
                              null,
                          },
                        )
                      }
                      className="mt-3 text-xs font-semibold text-[var(--gp-danger)]"
                    >
                      Hapus diskon
                    </button>
                  </div>
                )}

                {!draft.showVoucher ? (
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        draft.id,
                        {
                          showVoucher:
                            true,
                        },
                      )
                    }
                    className="rounded-xl border border-dashed border-[var(--gp-border)] bg-white p-4 text-left text-sm font-semibold text-[var(--gp-brand-primary)] transition hover:border-[var(--gp-brand-primary)]"
                  >
                    + Tambahkan voucher toko
                  </button>
                ) : (
                  <div className="rounded-xl border border-[var(--gp-border)] bg-white p-4">
                    <CurrencyInput
                      id={`${draft.id}-voucher`}
                      label="Voucher Toko"
                      value={
                        draft.voucher
                      }
                      onValueChange={(
                        value,
                      ) =>
                        onChange(
                          draft.id,
                          {
                            voucher:
                              value,
                          },
                        )
                      }
                      placeholder="Rp5.000"
                      helperText="Voucher yang ditanggung seller."
                    />

                    <button
                      type="button"
                      onClick={() =>
                        onChange(
                          draft.id,
                          {
                            showVoucher:
                              false,

                            voucher:
                              null,
                          },
                        )
                      }
                      className="mt-3 text-xs font-semibold text-[var(--gp-danger)]"
                    >
                      Hapus voucher
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--gp-border)] pt-5">
              <p className="text-sm font-bold">
                Target Profit Scenario
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
                Default mengikuti
                Current, tetapi bisa
                diubah khusus untuk
                scenario ini.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ScenarioTargetOption
                  checked={
                    draft.targetMode ===
                    "NONE"
                  }
                  title="Belum tahu"
                  onClick={() =>
                    changeTargetMode(
                      "NONE",
                    )
                  }
                />

                <ScenarioTargetOption
                  checked={
                    draft.targetMode ===
                    "AMOUNT_PER_ORDER"
                  }
                  title="Rp / order"
                  onClick={() =>
                    changeTargetMode(
                      "AMOUNT_PER_ORDER",
                    )
                  }
                />

                <ScenarioTargetOption
                  checked={
                    draft.targetMode ===
                    "NET_MARGIN_PERCENT"
                  }
                  title="Net Margin"
                  onClick={() =>
                    changeTargetMode(
                      "NET_MARGIN_PERCENT",
                    )
                  }
                />

                <ScenarioTargetOption
                  checked={
                    draft.targetMode ===
                    "HPP_MARKUP_PERCENT"
                  }
                  title="% HPP"
                  onClick={() =>
                    changeTargetMode(
                      "HPP_MARKUP_PERCENT",
                    )
                  }
                />
              </div>

              {draft.targetMode !==
                "NONE" && (
                <div className="mt-4 max-w-md rounded-xl border border-[var(--gp-border)] bg-white p-4">
                  {draft.targetMode ===
                  "AMOUNT_PER_ORDER" ? (
                    <CurrencyInput
                      id={`${draft.id}-target-amount`}
                      label="Target Profit / Order"
                      value={
                        draft.targetAmount
                      }
                      onValueChange={(
                        value,
                      ) =>
                        onChange(
                          draft.id,
                          {
                            targetAmount:
                              value,
                          },
                        )
                      }
                      placeholder="Rp25.000"
                    />
                  ) : (
                    <PercentageInput
                      id={`${draft.id}-target-rate`}
                      label={
                        draft.targetMode ===
                        "NET_MARGIN_PERCENT"
                          ? "Target Net Margin"
                          : "Target Profit dari HPP"
                      }
                      valueBps={
                        draft.targetRateBps
                      }
                      onValueChange={(
                        value,
                      ) =>
                        onChange(
                          draft.id,
                          {
                            targetRateBps:
                              value,
                          },
                        )
                      }
                      placeholder={
                        draft.targetMode ===
                        "NET_MARGIN_PERCENT"
                          ? "20"
                          : "30"
                      }
                    />
                  )}
                </div>
              )}
            </div>

            {scenario.error && (
              <div className="mt-5 rounded-xl border border-[var(--gp-danger)] bg-[var(--gp-danger-soft)] p-4">
                <p className="text-xs font-semibold text-[var(--gp-danger)]">
                  {scenario.error}
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onCalculate(
                    draft.id,
                  )
                }
                className="min-h-10 rounded-[var(--gp-radius-button)] bg-[var(--gp-text-primary)] px-4 text-sm font-bold text-white transition hover:opacity-90"
              >
                Hitung Skenario
              </button>

              {scenario.dirty ? (
                <span className="text-xs font-medium text-[var(--gp-warning)]">
                  Perubahan belum dihitung
                </span>
              ) : (
                <span className="text-xs font-medium text-[var(--gp-success)]">
                  Hasil sudah diperbarui
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function ScenarioCollapsedSummary({
  scenario,
}: {
  scenario: ScenarioItem;
}) {
  return (
    <div className="mt-5 grid gap-3 border-t border-[var(--gp-border)] pt-4 sm:grid-cols-3">
      <MiniMetric
        label="Harga"
        value={
          scenario.draft
            .listPrice === null
            ? "—"
            : formatMoney(
                scenario.draft
                  .listPrice,
              )
        }
      />

      <MiniMetric
        label="Profit sebelum iklan"
        value={
          scenario.dirty
            ? "Hitung ulang"
            : formatMoney(
                scenario.result
                  .breakdown
                  .contributionBeforeAds,
              )
        }
      />

      <MiniMetric
        label="Status"
        value={
          scenario.dirty
            ? "Belum dihitung"
            : getScenarioStatusLabel(
                scenario.result,
              )
        }
      />
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--gp-border)] bg-white p-3">
      <p className="text-[10px] font-medium text-[var(--gp-text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function ScenarioTargetOption({
  checked,
  title,
  onClick,
}: {
  checked: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "rounded-xl border px-3 py-3 text-left text-xs font-semibold transition",
        checked
          ? "border-[var(--gp-brand-primary)] bg-[var(--gp-brand-soft)] text-[var(--gp-text-primary)]"
          : "border-[var(--gp-border)] bg-white text-[var(--gp-text-secondary)] hover:border-[var(--gp-text-muted)]",
      ].join(" ")}
    >
      <span className="flex items-center gap-2">
        <span
          className={[
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
            checked
              ? "border-[var(--gp-brand-primary)]"
              : "border-[var(--gp-border)]",
          ].join(" ")}
        >
          {checked && (
            <span className="h-2 w-2 rounded-full bg-[var(--gp-brand-primary)]" />
          )}
        </span>

        {title}
      </span>
    </button>
  );
}

function ScenarioComparison({
  baseInput,
  baseResult,
  scenarios,
}: {
  baseInput: PlanAdsInput;
  baseResult: PlanAdsResult;
  scenarios: ScenarioItem[];
}) {
  const calculatedScenarios =
    scenarios.filter(
      (scenario) =>
        !scenario.dirty &&
        !scenario.error,
    );

  const candidates = [
    {
      id:
        "current",

      profit:
        baseResult.breakdown
          .contributionBeforeAds,
    },

    ...calculatedScenarios.map(
      (scenario) => ({
        id:
          scenario.draft.id,

        profit:
          scenario.result
            .breakdown
            .contributionBeforeAds,
      }),
    ),
  ];

  const highestProfit =
    Math.max(
      ...candidates.map(
        (candidate) =>
          candidate.profit,
      ),
    );

  return (
    <div className="mt-8 border-t border-[var(--gp-border)] pt-7">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
        Comparison
      </p>

      <h3 className="mt-2 text-xl font-bold">
        Bandingkan hasil
      </h3>

      <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--gp-text-secondary)]">
        Hanya scenario yang sudah
        dihitung yang masuk ke
        comparison. Label profit
        terbesar membandingkan
        contribution sebelum iklan,
        bukan rekomendasi.
      </p>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-3">
        <ComparisonCard
          name="Current"
          input={
            baseInput
          }
          result={
            baseResult
          }
          isCurrent
          highestProfit={
            baseResult
              .breakdown
              .contributionBeforeAds ===
            highestProfit
          }
        />

        {calculatedScenarios.map(
          (scenario) => (
            <ComparisonCard
              key={
                scenario
                  .draft.id
              }
              name={
                scenario
                  .draft.name
              }
              input={
                scenario.input
              }
              result={
                scenario.result
              }
              highestProfit={
                scenario
                  .result
                  .breakdown
                  .contributionBeforeAds ===
                highestProfit
              }
            />
          ),
        )}
      </div>

      {scenarios.some(
        (scenario) =>
          scenario.dirty,
      ) && (
        <p className="mt-2 text-xs leading-5 text-[var(--gp-warning)]">
          Ada perubahan scenario
          yang belum dihitung.
          Klik Hitung Skenario agar
          hasil terbaru masuk ke
          comparison.
        </p>
      )}
    </div>
  );
}

function ComparisonCard({
  name,
  input,
  result,
  highestProfit,
  isCurrent = false,
}: {
  name: string;
  input: PlanAdsInput;
  result: PlanAdsResult;
  highestProfit: boolean;
  isCurrent?: boolean;
}) {
  const breakEvenRoas =
    getBreakEvenRoas(
      result,
    );

  const targetRoas =
    getTargetRoas(
      result,
    );

  return (
    <article className="min-w-[270px] flex-1 rounded-2xl border border-[var(--gp-border)] bg-white p-5 md:min-w-[290px]">
      <div className="flex min-h-7 items-start justify-between gap-3">
        <h4 className="font-bold">
          {name}
        </h4>

        <div className="flex flex-wrap justify-end gap-1.5">
          {isCurrent && (
            <span className="rounded-full bg-[var(--gp-info-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--gp-info)]">
              CURRENT
            </span>
          )}

          {highestProfit && (
            <span className="rounded-full bg-[var(--gp-success-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--gp-success)]">
              PROFIT TERBESAR
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <CompareRow
          label="Status"
          value={
            getScenarioStatusLabel(
              result,
            )
          }
        />

        <CompareRow
          label="Harga"
          value={
            formatMoney(
              input.listPrice,
            )
          }
        />

        <CompareRow
          label="Harga efektif"
          value={
            formatMoney(
              result.breakdown
                .pricing
                .effectiveRevenue,
            )
          }
        />

        <CompareRow
          label="HPP"
          value={
            formatMoney(
              input.hppPerUnit,
            )
          }
        />

        <CompareRow
          label="Target Profit"
          value={
            formatTargetProfit(
              input,
            )
          }
        />

        <CompareRow
          label="Profit sebelum iklan"
          value={
            formatMoney(
              result.breakdown
                .contributionBeforeAds,
            )
          }
          strong
        />

        <CompareRow
          label="ROAS BEP"
          value={
            breakEvenRoas ===
            null
              ? "—"
              : formatRoas(
                  breakEvenRoas,
                )
          }
        />

        <CompareRow
          label="Target ROAS"
          value={
            targetRoas ===
            null
              ? "—"
              : formatRoas(
                  targetRoas,
                )
          }
        />
      </div>
    </article>
  );
}

function CompareRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--gp-border)] pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-[var(--gp-text-secondary)]">
        {label}
      </span>

      <span
        className={[
          "max-w-[150px] text-right text-sm",
          strong
            ? "font-bold"
            : "font-semibold",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function ScenarioEmptyState() {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-[var(--gp-border)] bg-[var(--gp-surface-soft)] px-5 py-8 text-center">
      <p className="font-semibold">
        Belum ada skenario
        pembanding
      </p>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--gp-text-secondary)]">
        Buat Scenario A dari
        hasil perhitunganmu saat
        ini, lalu coba ubah harga,
        biaya, potongan, atau
        target profit.
      </p>
    </div>
  );
}

function findNextScenarioNumber(
  scenarios:
    ScenarioItem[],
): number {
  for (
    let number = 1;
    number <= 3;
    number += 1
  ) {
    const id =
      `scenario-${number}`;

    const used =
      scenarios.some(
        (scenario) =>
          scenario.draft.id ===
          id,
      );

    if (!used) {
      return number;
    }
  }

  return (
    scenarios.length + 1
  );
}

function getScenarioNumber(
  id: string,
): number {
  const parsed =
    Number(
      id.replace(
        "scenario-",
        "",
      ),
    );

  if (
    Number.isInteger(
      parsed,
    ) &&
    parsed > 0
  ) {
    return parsed;
  }

  return 1;
}

function getDefaultScenarioName(
  id: string,
): string {
  const number =
    getScenarioNumber(
      id,
    );

  const names = [
    "Scenario A",
    "Scenario B",
    "Scenario C",
  ];

  return (
    names[number - 1] ??
    `Scenario ${number}`
  );
}

function getBreakEvenRoas(
  result:
    PlanAdsResult,
): number | null {
  if (
    result.status ===
    "NOT_ADS_FEASIBLE"
  ) {
    return null;
  }

  return (
    result.breakEvenRoas
  );
}

function getTargetRoas(
  result:
    PlanAdsResult,
): number | null {
  if (
    result.status !==
    "TARGET_FEASIBLE"
  ) {
    return null;
  }

  return (
    result.minimumTargetRoas
  );
}

function getScenarioStatusLabel(
  result:
    PlanAdsResult,
): string {
  switch (
    result.status
  ) {
    case "TARGET_FEASIBLE":
      return "Target feasible";

    case "BREAK_EVEN_ONLY":
      return "BEP saja";

    case "TARGET_NOT_FEASIBLE":
      return "Target belum memungkinkan";

    case "NOT_ADS_FEASIBLE":
      return "Belum layak ads";
  }
}

function formatTargetProfit(
  input:
    PlanAdsInput,
): string {
  const target =
    input.targetProfit;

  if (
    target.mode === "NONE"
  ) {
    return "Tidak ditentukan";
  }

  if (
    target.mode ===
    "AMOUNT_PER_ORDER"
  ) {
    return `${formatMoney(
      target.amount,
    )} / order`;
  }

  if (
    target.mode ===
    "NET_MARGIN_PERCENT"
  ) {
    return `${formatBps(
      target.rateBps,
    )} margin`;
  }

  return `${formatBps(
    target.rateBps,
  )} dari HPP`;
}

function formatMoney(
  value: number,
): string {
  if (
    value < 0
  ) {
    return `-Rp${Math.abs(
      value,
    ).toLocaleString(
      "id-ID",
    )}`;
  }

  return `Rp${value.toLocaleString(
    "id-ID",
  )}`;
}

function formatRoas(
  value: number,
): string {
  return value.toLocaleString(
    "id-ID",
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    },
  );
}

function formatBps(
  valueBps: number,
): string {
  return `${(
    valueBps / 100
  ).toLocaleString(
    "id-ID",
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    },
  )}%`;
}

function getScenarioValidationMessage(
  code: string,
): string {
  switch (code) {
    case "LIST_PRICE_INVALID":
      return "Harga scenario harus lebih besar dari Rp0.";

    case "HPP_INVALID":
      return "Modal / HPP scenario tidak valid.";

    case "ADJUSTMENT_INVALID":
      return "Diskon atau voucher scenario tidak valid.";

    case "DISCOUNT_EXCEEDS_PRICE":
      return "Diskon scenario tidak boleh lebih besar dari Harga Normal.";

    case "EFFECTIVE_PRICE_NON_POSITIVE":
      return "Potongan scenario membuat harga efektif menjadi Rp0 atau negatif.";

    case "FEE_RATE_INVALID":
      return "Persentase biaya scenario tidak valid.";

    case "FIXED_FEE_INVALID":
      return "Biaya tetap scenario tidak valid.";

    case "COST_INVALID":
      return "Biaya operasional scenario tidak valid.";

    case "TARGET_AMOUNT_INVALID":
      return "Target Profit scenario tidak valid.";

    case "TARGET_RATE_INVALID":
      return "Persentase Target Profit scenario tidak valid.";

    default:
      return "Skenario belum valid. Periksa kembali angka yang kamu masukkan.";
  }
}