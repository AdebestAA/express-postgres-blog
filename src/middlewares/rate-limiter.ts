import rateLimit from "express-rate-limit";

const message = (msg: string) => ({ success: false, message: msg });

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: message("Too many attempts. Please try again in a few minutes."),
});
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: message("Too many attempts. Please try again in a few minutes."),
});
