import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../backend/src/index";

describe("Backend Routes Test Suite", () => {
  describe("Health Check GET /", () => {
    it("should return status ok", async () => {
      const res = await request(app).get("/");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });

  describe("POST /analyze", () => {
    it("should return 400 when missing required fields", async () => {
      const res = await request(app).post("/analyze").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("should return 400 when cvText is missing", async () => {
      const res = await request(app).post("/analyze").send({
        jobTitle: "Frontend Engineer",
        company: "Acme Corp",
        jobDescription: "Looking for React developer"
      });
      expect(res.status).toBe(400);
    });

    it("should successfully analyze a job with CV", async () => {
      const res = await request(app).post("/analyze").send({
        jobTitle: "Senior TypeScript Engineer",
        company: "Safaricom",
        jobDescription: "Looking for an experienced TypeScript and React developer with Node.js and Docker skills.",
        cvText: "Software Engineer with 5 years experience in TypeScript, React, Docker, and REST APIs."
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("matchScore");
      expect(typeof res.body.matchScore).toBe("number");
      expect(res.body.matchScore).toBeGreaterThanOrEqual(0);
      expect(res.body.matchScore).toBeLessThanOrEqual(100);
      expect(res.body).toHaveProperty("skillGaps");
      expect(Array.isArray(res.body.skillGaps)).toBe(true);
      expect(res.body).toHaveProperty("strengths");
      expect(Array.isArray(res.body.strengths)).toBe(true);
      expect(res.body).toHaveProperty("salaryBenchmark");
      expect(res.body.salaryBenchmark).toHaveProperty("median");
      expect(res.body).toHaveProperty("companyRating");
      expect(res.body.companyRating).toHaveProperty("rating");
    });
  });

  describe("GET /company/:name", () => {
    it("should return company ratings and reviews", async () => {
      const res = await request(app).get("/company/Google");
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Google");
      expect(res.body.rating).toBeGreaterThan(0);
      expect(res.body.reviews).toBeGreaterThan(0);
      expect(res.body.source).toBe("Glassdoor");
    });
  });

  describe("GET /salary", () => {
    it("should return 400 if title query parameter is missing", async () => {
      const res = await request(app).get("/salary");
      expect(res.status).toBe(400);
    });

    it("should return salary benchmark when title is provided", async () => {
      const res = await request(app).get("/salary?title=Software%20Engineer&location=Nairobi,%20Kenya");
      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Software Engineer");
      expect(res.body.min).toBeDefined();
      expect(res.body.median).toBeDefined();
      expect(res.body.max).toBeDefined();
      expect(res.body.currency).toBe("KES");
    });
  });

  describe("POST /cv/upload", () => {
    it("should return 400 when no file is uploaded", async () => {
      const res = await request(app).post("/cv/upload");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("No file uploaded");
    });

    it("should extract text when a PDF buffer is attached", async () => {
      // Small valid PDF minimal binary representation
      const minimalPdf = Buffer.from(
        "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF"
      );

      const res = await request(app)
        .post("/cv/upload")
        .attach("cv", minimalPdf, "sample_resume.pdf");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("text");
    });
  });
});
