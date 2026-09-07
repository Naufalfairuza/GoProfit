"use client";

import * as Sentry from "@sentry/nextjs";
import { type FormEvent, useState } from "react";

const issueTypes = [
  { value: "calculation", label: "Hasil perhitungan" },
  { value: "input", label: "Input atau validasi" },
  { value: "interface", label: "Tampilan atau navigasi" },
  { value: "other", label: "Lainnya" },
] as const;

type SubmissionState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

export function ReportIssueButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [issueType, setIssueType] = useState<
    (typeof issueTypes)[number]["value"]
  >("calculation");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>(null);

  function openDialog() {
    setSubmissionState(null);
    setIsOpen(true);
  }

  function closeDialog() {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionState(null);

    try {
      if (!Sentry.getClient()) {
        setSubmissionState({
          type: "error",
          message:
            "Form laporan belum tersambung. Silakan coba lagi setelah deployment terbaru aktif.",
        });
        return;
      }

      Sentry.captureFeedback({
        message: `[${getIssueTypeLabel(issueType)}] ${message.trim()}`,
        email: email.trim() || undefined,
        url: window.location.href,
        source: "goprofit-feedback",
        tags: {
          page: window.location.pathname,
          issue_type: issueType,
        },
      });

      setMessage("");
      setEmail("");
      setSubmissionState({
        type: "success",
        message: "Terima kasih. Laporanmu sudah terkirim ke tim GOProfit.",
      });
    } catch {
      setSubmissionState({
        type: "error",
        message: "Laporan belum terkirim. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="shrink-0 font-semibold text-[var(--gp-text-secondary)] underline-offset-4 transition hover:text-[var(--gp-brand-primary)] hover:underline"
      >
        Laporkan masalah
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(32,33,36,0.42)] p-3 sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <section
            aria-labelledby="report-issue-title"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-[var(--gp-border)] bg-white p-5 shadow-[0_20px_60px_rgba(32,33,36,0.18)] sm:p-6"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
                  Feedback beta
                </p>
                <h2
                  id="report-issue-title"
                  className="mt-1 text-xl font-bold tracking-[-0.03em]"
                >
                  Laporkan masalah
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                aria-label="Tutup laporan masalah"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--gp-border)] text-lg text-[var(--gp-text-secondary)] transition hover:border-[var(--gp-brand-primary)] hover:text-[var(--gp-brand-primary)]"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-[var(--gp-text-secondary)]">
              Ceritakan apa yang terjadi agar kami bisa memperbaiki GOProfit.
              Jangan masukkan password, token, atau data sensitif toko.
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-[var(--gp-text-primary)]">
                Jenis masalah
                <select
                  value={issueType}
                  onChange={(event) =>
                    setIssueType(event.target.value as typeof issueType)
                  }
                  className="mt-2 min-h-11 w-full rounded-xl border border-[var(--gp-border)] bg-white px-3 text-sm font-normal outline-none transition focus:border-[var(--gp-brand-primary)]"
                >
                  {issueTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-[var(--gp-text-primary)]">
                Apa yang terjadi?
                <textarea
                  required
                  minLength={10}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Contoh: hasil Check My Ads berbeda dari laporan campaign saya..."
                  className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[var(--gp-border)] bg-white px-3 py-3 text-sm font-normal leading-6 outline-none transition placeholder:text-[var(--gp-text-muted)] focus:border-[var(--gp-brand-primary)]"
                />
              </label>

              <label className="block text-sm font-semibold text-[var(--gp-text-primary)]">
                Email untuk dihubungi (opsional)
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@email.com"
                  className="mt-2 min-h-11 w-full rounded-xl border border-[var(--gp-border)] bg-white px-3 text-sm font-normal outline-none transition placeholder:text-[var(--gp-text-muted)] focus:border-[var(--gp-brand-primary)]"
                />
              </label>

              {submissionState && (
                <p
                  className={[
                    "rounded-xl px-3 py-3 text-sm leading-5",
                    submissionState.type === "success"
                      ? "bg-[var(--gp-success-soft)] text-[var(--gp-success)]"
                      : "bg-[var(--gp-danger-soft)] text-[var(--gp-danger)]",
                  ].join(" ")}
                  role="status"
                >
                  {submissionState.message}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="min-h-11 rounded-xl border border-[var(--gp-border)] px-4 text-sm font-bold text-[var(--gp-text-secondary)] transition hover:border-[var(--gp-brand-primary)] hover:text-[var(--gp-brand-primary)]"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 rounded-xl bg-[var(--gp-brand-primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--gp-brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim laporan"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function getIssueTypeLabel(value: (typeof issueTypes)[number]["value"]): string {
  return issueTypes.find((item) => item.value === value)?.label ?? "Lainnya";
}
