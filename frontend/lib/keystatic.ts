/** The admin runs in development, and in production once the GitHub App's credentials are set. */
export const keystaticEnabled =
  process.env.NODE_ENV === "development" ||
  Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_ID && process.env.KEYSTATIC_GITHUB_CLIENT_SECRET && process.env.KEYSTATIC_SECRET);
