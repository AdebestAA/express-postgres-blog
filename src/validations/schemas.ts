import z from "zod";

// signup schema and type
export const signUpSchema = z.object({
  nickname: z
    .string()
    .min(3, { message: "nickname must be atleast 3 characters" }),
  email: z.email({ message: "invalid email entered" }),
  password: z
    .string()
    .min(3, { message: "password must be more than three characters" }),
});
export type signupType = z.infer<typeof signUpSchema>;
// signin schema and type
export const signInSchema = z.object({
  email: z.email({ message: "invalid email entered" }),
  password: z
    .string()
    .min(3, { message: "password must be more than three characters" }),
});
export type signinType = z.infer<typeof signInSchema>;

// email verify schema and type
export const emailVerifySchema = z.object({
  email: z.email({ message: "invalid email entered" }),
  otp: z.string().length(6, { message: "password length must be string" }),
});

export type emailVerifyType = z.infer<typeof emailVerifySchema>;
// create post schema
export const createPostSchema = z.object({
  content: z.string({ message: "empty field" }),
  // email: z.email({ message: "email is verified" }),
});

export type createPostType = z.infer<typeof createPostSchema>;

// comment schema
export const createCommentSchema = z.object({
  comment: z.string({ message: "empty field" }),
  post_id: z.string({ message: "Post Id is required" }),
});

export type createCommentType = z.infer<typeof createCommentSchema>;

export const editPostSchema = z.object({
  content: z.string({ message: "empty field" }),
  post_id: z.string({ message: "param is needed" }),
});

export type editPostType = z.infer<typeof editPostSchema>;

export const updateUserDataSchema = z.object({
  nickname: z.string().optional(),
  first_name: z
    .string()
    .min(3, { message: "first name must be more than 3 character" })
    .optional(),
  last_name: z
    .string()
    .min(3, { message: "last name must be more than 3 characters" })
    .optional(),
});

export type updateUserDataType = z.infer<typeof updateUserDataSchema>;

export const paramSchema = z.object({
  nickname: z.string().optional(),
});

export type paramSchemaDataType = z.infer<typeof paramSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export type forgotPasswordDataType = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.email(),
  otp: z.string().length(6, { message: "otp must be 6 characters" }),
  new_password: z
    .string()
    .min(5, { message: "password should be more than 5 characters" }),
});

export type resetPasswordDataType = z.infer<typeof resetPasswordSchema>;
