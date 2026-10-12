import dotenv from "dotenv";

import z, { ZodObject } from "zod";
dotenv.config();
export const brevo_api_key = process.env.BREVO_API_KEY!;
export const redisUrl = process.env.REDIS_URL!;
export const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
export const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
export const nodeEnvironment = process.env.NODE_ENV!;
export const googleClientId = process.env.GOOGLE_CLIENT_ID!;
export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;
// Must mirror the frontend origin: Google requires the redirect_uri used in the
// token exchange to be byte-identical to the one used in the authorize request.
export const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5179";

export const dynamicSchema = <T extends ZodObject>(
  schema: T,
  data: z.infer<T>,
) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const firstIssue = result.error.issues[0];

    return {
      success: false,
      message: firstIssue?.message ?? "Validation failed",
      errors: result.error.flatten().fieldErrors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
};
