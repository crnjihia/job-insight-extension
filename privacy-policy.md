# Privacy Policy – Job Insight Extension

**Effective date:** 2026‑10‑03  

Job Insight Extension (“we”, “our”, “us”) is a Chrome extension that helps job seekers by overlaying data (salary benchmarks, company ratings, and AI‑generated match scores) onto job‑listing sites.

## 1️⃣ What data do we collect?
- **CV Text** – When you upload a CV (PDF) through the Options page, the raw text is extracted and **sent** to our backend API (`/cv/upload`) solely for the purpose of generating a match score.  
- **Job Listing Details** – Title, company name, and full job description are harvested from the three supported sites (BrighterMonday, LinkedIn, Fuzu) **in‑memory only** and sent to the `/analyze` endpoint to compute a match score.  
- **Usage Metrics** – Chrome storage (`chrome.storage.sync`) holds your chosen preferences (salary currency, notification toggles). No personally‑identifiable data is stored locally beyond what you explicitly upload.

## 2️⃣ How is your data used?
- **CV text** and **job description** are combined into a SHA‑256 hash. The resulting hash is cached in Redis for 24 h to avoid duplicate calls.
- **Match scoring** is performed by the Claude API (Anthropic). The API receives the CV text and job description only for the duration of the request; we do not retain the raw payload after the scoring response is returned.
- **Company ratings** and **salary benchmarks** are cached in MongoDB after the first fetch; these datasets are publicly sourced or scraped from third‑party services.

## 3️⃣ Who can see your data?
- **You** – All data you upload is stored only on our backend for the duration of the analysis. No data is shared with third parties.
- **Anthropic (Claude API)** – The raw CV & job description is sent to Anthropic’s service for inference. Their privacy terms apply.
- **Our servers** – Temporary logs (IP address, request timestamps) are kept for rate‑limiting and security purposes.

## 4️⃣ Data Retention
- **CV & job description** – Discarded after the match score is computed, except when cached (hash → score) for 24 h in Redis.
- **Company & salary data** – Persisted in MongoDB until manually purged or the database is recycled.
- **Log files** – Kept for 30 days.

## 5️⃣ Your Rights
- You may **delete** your uploaded CV by removing it from the Options page; this clears the stored text from Chrome storage and prevents further analysis.
- You can **revoke** the extension’s permissions at any time via Chrome’s extension settings.

## 6️⃣ Security Measures
- All API traffic uses **HTTPS**.
- Rate limiting (20 req/min per IP) and API‑key authentication protect the backend.
- Sensitive secrets (Claude API key, DB credentials) are stored only in server‑side environment variables.

## 7️⃣ Contact
If you have questions or concerns, please email: `privacy@jobinsight.io`.

---

*By installing and using the Job Insight Extension you acknowledge that you have read and understood this privacy policy.*
