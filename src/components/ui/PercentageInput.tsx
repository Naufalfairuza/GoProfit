"use client";

import { useState } from "react";

import {
    formatPercentageFromBps,
    parsePercentageToBps,
} from "@/lib/formatting/percentage";

interface PercentageInputProps {
  id: string;
  label: string;
  valueBps: number | null;
  onValueChange: (valueBps: number | null) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
}

export function PercentageInput({
  id,
  label,
  valueBps,
  onValueChange,
  placeholder = "0",
  helperText,
  error,
}: PercentageInputProps) {
  const [draft, setDraft] = useState(() =>
    valueBps === null ? "" : formatPercentageFromBps(valueBps),
  );
  const [isEditing, setIsEditing] = useState(false);

  const displayedValue = isEditing
    ? draft
    : valueBps === null
      ? ""
      : formatPercentageFromBps(valueBps);

  function handleChange(rawValue: string) {
    // Keep the user's raw text while typing so values such as "8," are not
    // immediately reformatted to "8" before the decimal is completed.
    setDraft(rawValue);
    onValueChange(parsePercentageToBps(rawValue));
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[var(--gp-text-primary)]"
      >
        {label}
      </label>

      <div className="relative">
        <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={displayedValue}
        onFocus={() => {
          setDraft(valueBps === null ? "" : formatPercentageFromBps(valueBps));
          setIsEditing(true);
        }}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={() => {
          setIsEditing(false);
          setDraft(valueBps === null ? "" : formatPercentageFromBps(valueBps));
        }}
        placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={[
            "h-12 w-full rounded-[var(--gp-radius-input)] border bg-white px-4 pr-12",
            "text-base font-semibold text-[var(--gp-text-primary)] outline-none",
            "transition placeholder:font-normal placeholder:text-[var(--gp-text-muted)]",
            error
              ? "border-[var(--gp-danger)] focus:ring-4 focus:ring-[var(--gp-danger-soft)]"
              : "border-[var(--gp-border)] focus:border-[var(--gp-brand-primary)] focus:ring-4 focus:ring-[var(--gp-brand-soft)]",
          ].join(" ")}
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--gp-text-secondary)]">
          %
        </span>
      </div>

      {error ? (
        <p className="mt-2 text-xs font-medium text-[var(--gp-danger)]">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-2 text-xs leading-5 text-[var(--gp-text-muted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
