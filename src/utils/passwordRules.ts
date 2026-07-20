/**
 * Mirrors password-rules.ts in the backend services. These drive live feedback
 * while typing; the backend is what actually enforces them.
 */
export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRule = {
  label: string;
  test: (value: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    label: `No mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (v) => v.length >= PASSWORD_MIN_LENGTH,
  },
  { label: "Uma letra minúscula", test: (v) => /[a-z]/.test(v) },
  { label: "Uma letra maiúscula", test: (v) => /[A-Z]/.test(v) },
  { label: "Um número", test: (v) => /\d/.test(v) },
  { label: "Um caractere especial", test: (v) => /[^A-Za-z\d]/.test(v) },
];

export const isPasswordValid = (value: string): boolean =>
  PASSWORD_RULES.every((rule) => rule.test(value));

export const passwordStrength = (value: string): number =>
  PASSWORD_RULES.filter((rule) => rule.test(value)).length;
