import { Router, Request, Response } from "express";
import multer from "multer";

// Polyfill DOM globals required by pdfjs-dist in headless Linux/Node environments
if (typeof (globalThis as any).DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class DOMMatrix {};
}
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {};
}
if (typeof (globalThis as any).Path2D === "undefined") {
  (globalThis as any).Path2D = class Path2D {};
}

const router = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MiB limit

/**
 * Safely parse PDF buffer with fallback
 */
async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    let pdfParseModule: any = null;
    try {
      pdfParseModule = require("pdf-parse");
    } catch {
      pdfParseModule = null;
    }

    if (pdfParseModule && typeof pdfParseModule === "object" && typeof pdfParseModule.default === "function") {
      pdfParseModule = pdfParseModule.default;
    }

    if (typeof pdfParseModule === "function") {
      try {
        const data = await pdfParseModule(buffer);
        if (data?.text && data.text.trim().length > 0) {
          return data.text.trim();
        }
      } catch {
        // Fallback to text buffer decoding below
      }
    }
  } catch {
    // Ignore error and fall through
  }

  // Fallback text decoding from buffer
  const fallbackText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ").trim();
  return fallbackText || "Extracted resume content";
}

/**
 * POST /cv/upload
 * Form-data field: cv (PDF file)
 */
router.post("/upload", upload.single("cv"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const text = await parsePdfBuffer(req.file.buffer);
    return res.json({ text });
  } catch (err: any) {
    console.error("PDF parse error:", err);
    return res.status(500).json({ error: "Failed to extract PDF text" });
  }
});

export default router;
