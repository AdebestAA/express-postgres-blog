import dotenv from "dotenv";

import z, { ZodObject } from "zod";
dotenv.config();
export const brevo_api_key = process.env.BREVO_API_KEY!;
export const redisUrl = process.env.REDIS_URL!;
export const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
export const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
export const nodeEnvironment = process.env.NODE_ENV!;

export const dynamicSchema = <T extends ZodObject>(
  schema: T,
  data: z.infer<T>,
) => {
  const result = schema.safeParse(data);
  console.log(data, "data");

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors, "here atleast");

    return {
      success: false,
      message: "Validation Failed",
    };
  }

  return {
    success: true,
    data: result.data,
  };
};
