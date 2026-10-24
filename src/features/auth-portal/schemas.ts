// Auth validation, built bottom-up as reusable blocks:
//   constants → field schemas → form schemas → inferred types.
// The form schemas are the single source of truth for both validation AND the form's field types
// (via z.infer), consumed by <FormBuilder schema={...} />.

import { z } from "zod";

// ── Layer 1: constants ────────────────────────────────────────────────────────
// These MIRROR Supabase Auth (the real authority, enforced server-side by GoTrue). We keep them
// here so the UI can validate up front and avoid pointless round-trips — not because the client is
// authoritative. Keep in sync with Dashboard → Authentication → Providers → Email.
export const PASSWORD_MIN_LENGTH = 6; // Supabase "Minimum password length" (default 6).
export const PASSWORD_MAX_LENGTH = 72; // bcrypt's hard limit in GoTrue — longer passwords are rejected.

// ── Layer 2: field schemas (the smallest reusable blocks) ─────────────────────

/** A present, valid email. Trimmed so trailing spaces don't cause a false "invalid". */
export const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

/**
 * A NEW password being created (sign-up, reset). Enforces the full policy — defined ONCE here and
 * reused everywhere a password is set, so the rule lives in a single place.
 */
export const newPasswordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`);

/**
 * An EXISTING password entered to sign in. Presence-only: the server verifies correctness, and we
 * must not re-impose the creation policy on older passwords that predate it.
 */
export const currentPasswordField = z.string().min(1, "Password is required");

// ── Layer 3: form schemas (composition of the field blocks) ───────────────────

export const signInSchema = z.object({
  email: emailField,
  password: currentPasswordField,
});

export const registerSchema = z.object({
  email: emailField,
  password: newPasswordField,
});

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z
  .object({
    password: newPasswordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Layer 4: inferred types ───────────────────────────────────────────────────

export type SignInValues = z.infer<typeof signInSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
