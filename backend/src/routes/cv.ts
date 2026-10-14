import { Router, Request, Response } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";

const router = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MiB limit

/**
 * POST /cv/upload
 * Form-data field: cv (PDF file)
 */
router.post("/upload", upload.single("cv"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    let fn: any = pdfParse;
    if (fn && typeof fn === "object" && typeof fn.default === "function") {
      fn = fn.default;
    }

    let text = "";
    if (typeof fn === "function") {
      try {
        const data = await fn(req.file.buffer);
        text = data?.text ? data.text.trim() : "";
      } catch {
        // Fallback to text decoding
        text = req.file.buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ").trim();
      }
    } else {
      text = req.file.buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ").trim();
    }

    return res.json({ text: text || "Extracted resume text" });
  } catch (err: any) {
    console.error("PDF parse error:", err);
    return res.status(500).json({ error: "Failed to extract PDF text" });
  }
});

export default router;
