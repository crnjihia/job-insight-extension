import { Router, Request, Response } from "express";
import { fetchCompanyRating } from "../services/scraper";

const router = Router();

/**
 * GET /company/:name
 * Glassdoor-style company rating lookup (cached in MongoDB)
 */
router.get("/:name", async (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.name || "").trim();
  if (!name) {
    return res.status(400).json({ error: "Company name parameter is required" });
  }

  try {
    const data = await fetchCompanyRating(name);
    return res.json({ name, ...data });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch company rating" });
  }
});

export default router;
