"use client";

import type { ChangeEvent } from "react";

import {
    formatIDR,
    parseIDRInput,
} from "@/lib/formatting/currency";

interface CurrencyInputProps {
  id: string;
  label: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export function CurrencyInput({
  id,
  label,
  value,
  onValueChange,
  placeholder = "Rp0",
  helperText,
  error,
  required = false,
}: CurrencyInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(parseIDRInput(event.target.value));
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[var(--gp-text-primary)]"
      >
        {label}

        {required && (
          <span className="ml-1 text-[var(--gp-danger)]">*</span>
        )}
      </label>

      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value === null ? "" : formatIDR(value)}
        onChange={handleChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error
            ? `${id}-error`
            : helperText
              ? `${id}-helper`
              : undefined
        }
        className={[
          "h-12 w-full rounded-[var(--gp-radius-input)] border bg-white px-4",
          "text-base font-semibold text-[var(--gp-text-primary)] outline-none",
          "transition placeholder:font-normal placeholder:text-[var(--gp-text-muted)]",
          error
            ? "border-[var(--gp-danger)] focus:ring-4 focus:ring-[var(--gp-danger-soft)]"
            : "border-[var(--gp-border)] focus:border-[var(--gp-brand-primary)] focus:ring-4 focus:ring-[var(--gp-brand-soft)]",
        ].join(" ")}
      />

      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 text-xs font-medium text-[var(--gp-danger)]"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${id}-helper`}
          className="mt-2 text-xs leading-5 text-[var(--gp-text-muted)]"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}