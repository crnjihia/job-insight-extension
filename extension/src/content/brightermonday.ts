import type { JobData } from "../shared/types";
import { injectSidebar, injectListingBadges } from "./injector";

export function isBrighterMondayJobDetail(): boolean {
  return Boolean(
    document.querySelector(".job-detail") ||
    document.querySelector("h1.job-title") ||
    document.querySelector("[data-testid='job-details']") ||
    location.pathname.includes("/job/")
  );
}

export function extractBrighterMondayJob(): JobData | null {
  const titleEl = document.querySelector("h1.job-title, [data-testid='job-title'], h1");
  const companyEl = document.querySelector(".company-name a, .company-name, [data-testid='company-name']");
  const descriptionEl = document.querySelector(".job-description, [data-testid='job-description'], .job__details");
  const locationEl = document.querySelector(".location, [data-testid='job-location'], .job-header__location");

  if (!titleEl && !descriptionEl) {
    return null;
  }

  const reqElements = document.querySelectorAll(".job-description ul li, .requirements ul li");
  const requirements: string[] = [];
  reqElements.forEach((el) => {
    const text = el.textContent?.trim();
    if (text) requirements.push(text);
  });

  return {
    jobTitle: titleEl?.textContent?.trim() || "Software Engineer",
    company: companyEl?.textContent?.trim() || "Technology Company",
    jobDescription: descriptionEl?.textContent?.trim() || "",
    requirements: requirements.length > 0 ? requirements : undefined,
    location: locationEl?.textContent?.trim() || "Nairobi, Kenya",
    sourceUrl: window.location.href,
    sourcePlatform: "BrighterMonday"
  };
}

function init() {
  if (isBrighterMondayJobDetail()) {
    const job = extractBrighterMondayJob();
    if (job) {
      injectSidebar(job);
    }
  }

  // Inject badges on search results
  const cardSelector = ".search-result, article[data-job-id], .job-item, .job-card, [data-testid='listing-card']";
  injectListingBadges(cardSelector, "h2, h3, .job-item__title");

  // Dynamic observer for infinite scroll / pagination
  const observer = new MutationObserver(() => {
    injectListingBadges(cardSelector, "h2, h3, .job-item__title");
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
