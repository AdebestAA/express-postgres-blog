import dotenv from "dotenv";

import z, { ZodObject } from "zod";
dotenv.config();
export const brevo_api_key = process.env.BREVO_API_KEY!;

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
      message: "Validation Fail",
    };
  }

  return {
    success: true,
    data: result.data,
  };
};
