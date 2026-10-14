import rateLimit from "express-rate-limit";

export default rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000, // 1 minute
  max: Number(process.env.RATE_LIMIT_MAX) || 20, // 20 requests per window per IP
  message: { error: "Too many requests, please slow down." }
});
