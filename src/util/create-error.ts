export const createError = (status: number, message: string) => {
  const error = new Error(message) as Error & {
    status?: number;
  };

  error.status = status;

  return error;
};

/**
 * Pull the HTTP status off an error that was thrown via createError.
 * Falls back to 500 for anything unexpected (a genuine server bug).
 */
export const getErrorStatus = (error: unknown, fallback = 500): number => {
  if (error && typeof error === "object" && "status" in error) {
    const { status } = error as { status?: number };
    if (typeof status === "number") return status;
  }
  return fallback;
};

/**
 * Postgres error codes we map onto meaningful HTTP statuses.
 * https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const pgErrorStatus = (code: unknown): number | undefined => {
  switch (code) {
    case "23503": // foreign_key_violation -> referenced row missing
      return 404;
    case "23505": // unique_violation
      return 409;
    case "22P02": // invalid_text_representation (e.g. malformed uuid)
      return 400;
    case "23502": // not_null_violation
      return 400;
    default:
      return undefined;
  }
};
