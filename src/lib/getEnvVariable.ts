/**
 * safely retrieves an environment variable
 * if the variable is missing, it can either throw an error (for critical keys)
 * or return a safe fallback value like an empty string (for optional keys)
 */
export function getEnvVariable(
  key: string,
  required = true,
  fallback = "",
): string {
  const value = process.env[key];

  if (!value) {
    if (required) {
      throw new Error(`❌ Missing required environment variable: ${key}.`);
    }
    return fallback;
  }

  return value;
}
