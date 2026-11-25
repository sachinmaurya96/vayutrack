"use client";

import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle, Mail, Pencil, Phone } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { contact, emailWithSubject } from "@/content/site";
import { submitForm, type FormKind } from "@/lib/forms/submit";

export type Option = { value: string; label: string; description?: string };

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "url" | "date" | "textarea" | "select" | "choice";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url";
  options?: readonly Option[];
  format?: "email" | "phone" | "pincode" | "url" | "positive";
  span?: "full" | "half";
  /** Choice fields rendered as a compact segmented control. */
  compact?: boolean;
};

export type StepDef = { id: string; title: string; description?: string; fields: readonly FieldDef[] };

type Values = Record<string, string>;
type Errors = Record<string, string>;

type Props = {
  form: FormKind;
  steps: readonly StepDef[];
  submitLabel: string;
  /** Subject for the email fallback. */
  emailSubject: string;
  /** Wording for the result panels, e.g. "booking request". */
  noun: string;
  initialValues?: Values;
};

const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  pincode: /^\d{6}$/,
};

function validate(f: FieldDef, raw: string | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value) {
    if (!f.required) return null;
    if (f.type === "select") return `Select ${f.label.toLowerCase()}.`;
    if (f.type === "choice") return `Choose an option for “${f.label}”.`;
    return `Enter ${f.label.toLowerCase()}.`;
  }
  switch (f.format) {
    case "email":
      return PATTERNS.email.test(value) ? null : "Enter an email address like name@example.com.";
    case "phone": {
      const digits = value.replace(/[\s()-]/g, "").replace(/^\+/, "");
      return /^\d{10,13}$/.test(digits) ? null : "Enter a phone number with 10–13 digits.";
    }
    case "pincode":
      return PATTERNS.pincode.test(value) ? null : "Enter a 6-digit pincode.";
    case "url":
      try {
        new URL(/^https?:\/\//.test(value) ? value : `https://${value}`);
        return /\./.test(value) ? null : "Enter a website address like example.com.";
      } catch {
        return "Enter a website address like example.com.";
      }
    case "positive":
      return Number(value) > 0 ? null : `Enter a number greater than zero.`;
  }
  return null;
}

function displayValue(f: FieldDef, value: string) {
  if (!value) return "—";
  return f.options?.find((o) => o.value === value)?.label ?? value;
}

function emailBody(steps: readonly StepDef[], values: Values) {
  const lines: string[] = [];
  for (const s of steps) {
    const rows = s.fields.filter((f) => values[f.name]?.trim());
    if (!rows.length) continue;
    if (steps.length > 1) lines.push(`— ${s.title} —`);
    for (const f of rows) lines.push(`${f.label}: ${displayValue(f, values[f.name].trim())}`);
    lines.push("");
  }
  return lines.join("\n").slice(0, 1800);
}

/**
 * Accessible single- or multi-step form with validation, an error summary,
 * a review step, and honest submission states.
 */
export function SchemaForm({ form, steps, submitLabel, emailSubject, noun, initialValues }: Props) {
  const uid = useId();
  const multi = steps.length > 1;
  const reviewIndex = steps.length;
  const [values, setValues] = useState<Values>(() => ({ ...initialValues }));
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"editing" | "submitting" | "sent" | "not-configured" | "error">("editing");
  const [errorMessage, setErrorMessage] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const allFields = useMemo(() => steps.flatMap((s) => s.fields), [steps]);
  const fieldId = (name: string) => `${uid}-${name}`;

  function checkFields(fields: readonly FieldDef[]) {
    const next: Errors = {};
    for (const f of fields) {
      const msg = validate(f, values[f.name]);
      if (msg) next[f.name] = msg;
    }
    return next;
  }

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (touched && errors[name]) {
      const f = allFields.find((x) => x.name === name)!;
      const msg = validate(f, value);
      setErrors((e) => {
        const n = { ...e };
        if (msg) n[name] = msg;
        else delete n[name];
        return n;
      });
    }
  }

  function scrollToTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function failWith(found: Errors) {
    setErrors(found);
    setTouched(true);
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  function next() {
    const found = checkFields(steps[step].fields);
    if (Object.keys(found).length) return failWith(found);
    setErrors({});
    setStep((s) => s + 1);
    scrollToTop();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (multi && step < reviewIndex) return next();
    const found = checkFields(allFields);
    if (Object.keys(found).length) {
      if (multi) {
        const firstBad = steps.findIndex((s) => s.fields.some((f) => found[f.name]));
        setStep(firstBad);
      }
      return failWith(found);
    }
    setStatus("submitting");
    const clean = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
    const result = await submitForm(form, clean);
    if (result.kind === "error") setErrorMessage(result.message);
    setStatus(result.kind);
    scrollToTop();
  }

  const mailto = emailWithSubject(emailSubject, emailBody(steps, values));
  const errorList = Object.entries(errors);

  if (status === "sent" || status === "not-configured") {
    return (
      <div ref={topRef} className="scroll-mt-28">
        <div role="status" className="rounded-[var(--radius-card)] border border-blue-100 bg-blue-50 p-6 sm:p-8">
          <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-blue text-white">
            <Check className="size-6" strokeWidth={3} />
          </span>
          {status === "sent" ? (
            <>
              <h2 className="mt-4 text-[1.375rem] font-extrabold">Thank you — your {noun} has been sent.</h2>
              <p className="mt-2 text-ink">Our team will reply using the details you shared, during working hours ({contact.days}, {contact.hours}).</p>
            </>
          ) : (
            <>
              <h2 className="mt-4 text-[1.375rem] font-extrabold">Your {noun} is ready to send</h2>
              <p className="mt-2 max-w-[36rem] text-ink">
                Online submission isn’t connected yet, so <strong>nothing has been sent</strong>. Email these details to our team, or call the desk during working hours.
              </p>
              <div className="mt-5 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
                <a href={mailto} className="btn btn-primary">
                  <Mail aria-hidden className="size-4" /> Email these details
                </a>
                <a href={contact.phoneHref} className="btn btn-secondary">
                  <Phone aria-hidden className="size-4" /> Call {contact.phone}
                </a>
              </div>
            </>
          )}
        </div>
        <ReviewList steps={steps} values={values} />
        <button type="button" onClick={() => setStatus("editing")} className="link-arrow mt-4">
          <Pencil aria-hidden className="size-4" /> Edit details
        </button>
      </div>
    );
  }

  const current = multi ? steps[Math.min(step, steps.length - 1)] : steps[0];
  const onReview = multi && step === reviewIndex;

  return (
    <div ref={topRef} className="scroll-mt-28">
      {multi && (
        <nav aria-label="Form progress" className="mb-6">
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
            {[...steps.map((s) => s.title), "Review"].map((title, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={title} className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={i > step}
                    onClick={() => setStep(i)}
                    aria-current={active ? "step" : undefined}
                    className={`flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.875rem] font-bold transition-colors disabled:cursor-default ${
                      active ? "bg-navy text-white" : done ? "text-blue hover:bg-blue-50" : "text-muted"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex size-6 items-center justify-center rounded-full text-[0.8125rem] ${active ? "bg-white text-navy" : done ? "bg-blue text-white" : "border border-line-strong"}`}
                    >
                      {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                    </span>
                    {title}
                    <span className="sr-only">{done ? "(completed)" : active ? "(current)" : ""}</span>
                  </button>
                  {i < steps.length && <span aria-hidden className="hidden h-px w-4 bg-line-strong sm:block" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <form noValidate onSubmit={submit} aria-busy={status === "submitting"}>
        {errorList.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-6 rounded-2xl border border-error/30 bg-error-bg p-4 outline-none">
            <p className="flex items-center gap-2 font-bold text-error">
              <CircleAlert aria-hidden className="size-5" />
              {errorList.length === 1 ? "Please fix 1 field" : `Please fix ${errorList.length} fields`}
            </p>
            <ul className="mt-2 list-disc pl-6 text-[0.9375rem] text-ink">
              {errorList.map(([name, msg]) => (
                <li key={name}>
                  <a href={`#${fieldId(name)}`} className="underline underline-offset-2 hover:text-error">
                    {msg}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="mb-6 rounded-2xl border border-error/30 bg-error-bg p-4">
            <p className="font-bold text-error">Not sent</p>
            <p className="mt-1 text-[0.9375rem] text-ink">
              {errorMessage} Try again, or <a href={mailto} className="font-bold text-blue underline">email the details</a>.
            </p>
          </div>
        )}

        {onReview ? (
          <>
            <h2 className="text-[1.375rem] font-extrabold">Review your details</h2>
            <p className="mt-1 text-[0.9375rem] text-muted">Check everything before you submit. You can edit any section.</p>
            <ReviewList steps={steps} values={values} onEdit={(i) => setStep(i)} />
          </>
        ) : (
          <fieldset>
            <legend className={multi ? "text-[1.375rem] font-extrabold text-navy" : "sr-only"}>{current.title}</legend>
            {multi && current.description && <p className="mt-1 text-[0.9375rem] text-muted">{current.description}</p>}
            <div className={`grid gap-x-5 gap-y-5 sm:grid-cols-2 ${multi ? "mt-6" : ""}`}>
              {current.fields.map((f) => (
                <Field key={f.name} field={f} id={fieldId(f.name)} value={values[f.name] ?? ""} error={errors[f.name]} onChange={(v) => set(f.name, v)} />
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 xs:flex-row xs:items-center xs:justify-between">
          {multi && step > 0 ? (
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setStep((s) => s - 1);
                scrollToTop();
              }}
              className="btn btn-secondary"
            >
              <ArrowLeft aria-hidden className="size-4" /> Back
            </button>
          ) : (
            <p className="text-[0.875rem] text-muted">
              Fields marked <span aria-hidden className="font-bold text-error">*</span>
              <span className="sr-only">with an asterisk</span> are required.
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={status === "submitting"}>
            {status === "submitting" && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
            {multi && !onReview ? (
              <>
                Continue <ArrowRight aria-hidden className="size-4" />
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ field: f, id, value, error, onChange }: { field: FieldDef; id: string; value: string; error?: string; onChange: (v: string) => void }) {
  const hintId = f.hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const span = f.span === "full" || f.type === "textarea" ? "sm:col-span-2" : "";
  const base = `w-full rounded-xl border bg-white px-4 text-ink placeholder:text-muted focus-visible:outline-offset-1 ${error ? "border-error" : "border-line-strong"}`;
  const required = f.required ? (
    <>
      <span aria-hidden className="ml-0.5 text-error">
        *
      </span>
      <span className="sr-only">(required)</span>
    </>
  ) : null;

  const messages = (
    <>
      {f.hint && (
        <p id={hintId} className="mt-1.5 text-[0.875rem] text-muted">
          {f.hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-[0.875rem] font-semibold text-error">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}
    </>
  );

  if (f.type === "choice") {
    return (
      <fieldset className={span} aria-describedby={describedBy}>
        <legend className="mb-2 text-[0.9375rem] font-bold text-navy">
          {f.label}
          {required}
        </legend>
        <div className={f.compact ? "inline-flex flex-wrap gap-1 rounded-2xl border border-line bg-bg p-1" : "grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4"}>
          {f.options?.map((o, i) => {
            const checked = value === o.value;
            return (
              <label
                key={o.value}
                className={
                  f.compact
                    ? `flex min-h-11 cursor-pointer items-center rounded-xl px-4 text-[0.9375rem] font-bold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-blue ${
                        checked ? "bg-white text-navy shadow-[var(--shadow-soft)]" : "text-muted hover:text-navy"
                      }`
                    : `relative flex cursor-pointer flex-col gap-0.5 rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                        checked ? "border-blue bg-blue-50 shadow-[0_0_0_1px_var(--color-blue)]" : error ? "border-error bg-white" : "border-line-strong bg-white hover:border-blue"
                      }`
                }
              >
                <input
                  type="radio"
                  name={f.name}
                  value={o.value}
                  checked={checked}
                  onChange={() => onChange(o.value)}
                  id={i === 0 ? id : undefined}
                  className="sr-only"
                />
                {!f.compact && (
                  <span aria-hidden className={`absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border-2 ${checked ? "border-blue bg-blue" : "border-line-strong bg-white"}`}>
                    {checked && <span className="size-2 rounded-full bg-white" />}
                  </span>
                )}
                <span className={f.compact ? "" : "pr-7 font-bold text-navy"}>{o.label}</span>
                {o.description && <span className="text-[0.875rem] leading-snug text-muted">{o.description}</span>}
              </label>
            );
          })}
        </div>
        {messages}
      </fieldset>
    );
  }

  return (
    <div className={span}>
      <label htmlFor={id} className="mb-1.5 block text-[0.9375rem] font-bold text-navy">
        {f.label}
        {required}
      </label>
      {f.type === "textarea" ? (
        <textarea
          id={id}
          name={f.name}
          rows={5}
          value={value}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${base} min-h-32 py-3 leading-relaxed`}
        />
      ) : f.type === "select" ? (
        <select
          id={id}
          name={f.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          autoComplete={f.autoComplete}
          className={`${base} select-chevron h-12 appearance-none pr-10`}
        >
          <option value="">Select…</option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={f.name}
          type={f.type === "number" ? "text" : (f.type ?? "text")}
          inputMode={f.inputMode ?? (f.type === "number" ? "decimal" : undefined)}
          value={value}
          placeholder={f.placeholder}
          autoComplete={f.autoComplete}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${base} h-12`}
        />
      )}
      {messages}
    </div>
  );
}

function ReviewList({ steps, values, onEdit }: { steps: readonly StepDef[]; values: Values; onEdit?: (step: number) => void }) {
  return (
    <div className="mt-6 grid gap-4">
      {steps.map((s, i) => {
        const filled = s.fields.filter((f) => values[f.name]?.trim());
        if (!filled.length) return null;
        return (
          <section key={s.id} aria-label={s.title} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[1.0625rem] font-extrabold">{s.title}</h3>
              {onEdit && (
                <button type="button" onClick={() => onEdit(i)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-bold text-blue hover:bg-blue-50">
                  <Pencil aria-hidden className="size-4" /> Edit<span className="sr-only"> {s.title}</span>
                </button>
              )}
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {filled.map((f) => (
                <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                  <dt className="text-[0.875rem] font-semibold text-muted">{f.label}</dt>
                  <dd className="whitespace-pre-line break-words font-semibold text-ink">{displayValue(f, values[f.name].trim())}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
