/**
 * Form submission boundary.
 *
 * No form backend has been approved. Until NEXT_PUBLIC_FORMS_ENDPOINT is set,
 * forms validate locally and report "not-configured" so the UI can offer the
 * email/phone route instead. A form is only reported as sent when the
 * configured endpoint accepts it.
 *
 * Expected contract (adapt to the real backend): POST JSON
 * `{ form: FormKind, values: Record<string, string> }`, any 2xx = accepted.
 */

export type FormKind = "booking" | "business-enquiry" | "partner" | "contact" | "job-application";

export type SubmitResult = { kind: "sent" } | { kind: "not-configured" } | { kind: "error"; message: string };

export async function submitForm(form: FormKind, values: Record<string, string>): Promise<SubmitResult> {
  const endpoint = process.env.NEXT_PUBLIC_FORMS_ENDPOINT;
  if (!endpoint) return { kind: "not-configured" };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ form, values }),
    });
    if (res.ok) return { kind: "sent" };
    return { kind: "error", message: "The form could not be accepted right now." };
  } catch {
    return { kind: "error", message: "We couldn’t reach the server." };
  }
}
