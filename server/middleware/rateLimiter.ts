import rateLimit from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 10 : 100,
  message: { message: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 5 : 50,
  message: { message: "Too many password reset requests. Please try again after 1 hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProd ? 120 : 1000,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/api/auth/me"),
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProd ? 10 : 100,
  message: { message: "Too many payment requests. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});
