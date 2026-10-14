# Release Notes — Job Insight Extension v0.1.0 🚀

**Release Date:** October 14, 2026  
**Artifact:** `job-insight-extension-v0.1.0.zip`  
**Manifest Version:** V3  

---

## 🌟 Overview

We are thrilled to announce the official **v0.1.0** release of **Job Insight Extension**! 

Job Insight eliminates guesswork from your job search by injecting real-time intelligence overlays into job listings across **LinkedIn**, **BrighterMonday**, and **Fuzu**. Built on Chrome Manifest V3 and powered by a dual-engine architecture (offline heuristic + optional Claude 3.5 Sonnet LLM reasoning), Job Insight scores your resume match, identifies critical skill gaps, estimates regional salary benchmarks, and pulls verified company ratings.

---

## ✨ Key Features & Highlights

### 🎯 1. Real-Time Resume-to-Job Match Scoring (0–100%)
- Instant semantic evaluation comparing your uploaded CV against any active job listing.
- Color-coded matching tiers: Strong Match (75%+), Moderate Match (50–74%), and Low Match (<50%).
- Honest and transparent feedback identifying key strengths and specific missing requirements with priority tiers (P1/P2/P3).

### 💰 2. Regional Salary Benchmarks
- Localized compensation bands (minimum, median, maximum) for East Africa (KES) and global tech hubs (USD, EUR, GBP).
- Automatically populated directly into the job overlay drawer.

### 🏢 3. Glassdoor-Style Employer Intelligence
- Aggregated company ratings and total review counts to help candidates assess workplace culture before applying.
- Pre-cached with zero-delay lookups.

### 🛡️ 4. Encapsulated Shadow DOM Sidebar
- React 18 slide-out panel injected into a closed/open Shadow Root to prevent CSS conflicts with host pages (LinkedIn, BrighterMonday, Fuzu).
- Floating toggle badge and listing-card sparkles for non-intrusive, seamless browsing.

### 📄 5. Local PDF Resume Parser & Storage
- Native PDF text extraction with client-side offline storage via `chrome.storage.local`.
- Zero retention: CV data is processed in-memory and never permanently stored on third-party servers.

### ⚡ 6. Dual-Mode Intelligence Engine
- **Free Heuristic Engine (Default):** Zero API keys required; instant, privacy-respecting local matching.
- **Claude 3.5 Sonnet Engine (Optional):** Pay-as-you-go semantic deep dive via Anthropic API for nuanced qualification reasoning.

---

## 📦 What's Included

- `job-insight-extension-v0.1.0.zip`: Pre-built, zipped extension ready for upload to the Chrome Web Store or local unpacking.
- Complete Node.js + Express + TypeScript backend API with rate-limiting and Redis caching.
- Automated Vitest test suites (12/12 tests passing).

---

## 📥 Installation

### Load Unpacked in Chrome:
1. Download or clone this repository.
2. Unzip or build the extension: `npm run build:extension`.
3. Open `chrome://extensions/` &rarr; toggle on **Developer mode**.
4. Click **Load unpacked** and select `extension/dist`.

---

## 🔒 Privacy & Compliance
- Compliant with Google Chrome Web Store Single-Purpose and Privacy policies.
- See [privacy-policy.md](privacy-policy.md) for complete data processing disclosures.
