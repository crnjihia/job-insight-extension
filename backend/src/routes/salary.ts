import { Router, Request, Response } from "express";
import { fetchSalaryBenchmark } from "../services/scraper";

const router = Router();

/**
 * GET /salary?title=&location=
 * Salary benchmark lookup (cached in MongoDB)
 */
router.get("/", async (req: Request, res: Response) => {
  const title = String(req.query.title || "").trim();
  const location = String(req.query.location || "Nairobi, Kenya").trim();

  if (!title) {
    return res.status(400).json({ error: "Missing required query parameter: title" });
  }

  try {
    const data = await fetchSalaryBenchmark(title, location);
    return res.json({ title, location, ...data });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch salary benchmark" });
  }
});

export default router;
