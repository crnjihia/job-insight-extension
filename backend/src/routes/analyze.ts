import { Router, Request, Response } from "express";
import { getMatchScore } from "../services/claude";
import { makeAnalysisCacheKey, getAnalysisCache, setAnalysisCache } from "../services/cache";
import { fetchSalaryBenchmark, fetchCompanyRating } from "../services/scraper";
import { Analysis } from "../models/Analysis";
import mongoose from "mongoose";

const router = Router();

/**
 * POST /analyze
 * Body: { jobTitle, company, jobDescription, cvText }
 * Returns: { matchScore, skillGaps, strengths, summary, salaryBenchmark, companyRating }
 */
router.post("/", async (req: Request, res: Response) => {
  const { jobTitle, company, jobDescription, cvText } = req.body;

  if (!jobTitle || !company || !jobDescription || !cvText) {
    return res.status(400).json({
      error: "Missing required fields. Provide jobTitle, company, jobDescription, and cvText."
    });
  }

  const cacheKey = makeAnalysisCacheKey(jobDescription, cvText);

  // 1. Check Redis cache
  try {
    const cached = await getAnalysisCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }
  } catch {
    // Proceed to fresh analysis on cache error
  }

  // 2. Perform fresh analysis
  try {
    const [claudeResult, salaryBenchmark, companyRating] = await Promise.all([
      getMatchScore(jobTitle, company, jobDescription, cvText),
      fetchSalaryBenchmark(jobTitle),
      fetchCompanyRating(company)
    ]);

    const result = {
      ...claudeResult,
      salaryBenchmark,
      companyRating
    };

    // 3. Cache in Redis
    await setAnalysisCache(cacheKey, result);

    // 4. Cache in MongoDB Analysis collection
    if (mongoose.connection.readyState === 1) {
      try {
        await Analysis.findOneAndUpdate(
          { hashKey: cacheKey },
          { hashKey: cacheKey, result, createdAt: new Date() },
          { upsert: true }
        );
      } catch {
        // DB write skip
      }
    }

    return res.json(result);
  } catch (err: any) {
    console.error("Analysis execution error:", err);
    return res.status(500).json({ error: "Failed to perform job analysis" });
  }
});

export default router;
