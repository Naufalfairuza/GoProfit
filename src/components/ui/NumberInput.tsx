"use client";

interface NumberInputProps {
  id: string;
  label: string;
  value: number | null;
  onValueChange: (
    value: number | null,
  ) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  min?: number;
}

export function NumberInput({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  helperText,
  required = false,
  min = 0,
}: NumberInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[var(--gp-text-primary)]"
      >
        {label}

        {required && (
          <span className="ml-1 text-[var(--gp-danger)]">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        step="1"
        value={
          value === null
            ? ""
            : value
        }
        placeholder={
          placeholder
        }
        required={required}
        onChange={(event) => {
          const raw =
            event.target.value;

          if (raw === "") {
            onValueChange(null);
            return;
          }

          const parsed =
            Number(raw);

          if (
            !Number.isFinite(
              parsed,
            )
          ) {
            return;
          }

          onValueChange(
            Math.trunc(parsed),
          );
        }}
        className="min-h-12 w-full rounded-xl border border-[var(--gp-border)] bg-white px-4 text-sm font-semibold text-[var(--gp-text-primary)] outline-none transition placeholder:font-normal placeholder:text-[var(--gp-text-muted)] focus:border-[var(--gp-brand-primary)]"
      />

      {helperText && (
        <p className="mt-2 text-xs leading-5 text-[var(--gp-text-muted)]">
          {helperText}
        </p>
      )}
    </div>
  );
}