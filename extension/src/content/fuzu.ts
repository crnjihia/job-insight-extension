import type { JobData } from "../shared/types";
import { injectSidebar, injectListingBadges } from "./injector";

export function isFuzuJobDetail(): boolean {
  return Boolean(
    document.querySelector(".job-detail-section") ||
    document.querySelector(".job-overview") ||
    document.querySelector("h1.job-title") ||
    location.pathname.includes("/job/") ||
    location.pathname.includes("/jobs/")
  );
}

export function extractFuzuJob(): JobData | null {
  const titleEl = document.querySelector("h1.job-title, h1, .job-header__title");
  const companyEl = document.querySelector(".company-name, .company-title, .job-company a, .job-header__company");
  const descriptionEl = document.querySelector(".job-description, .job-details-content, .job-overview__description");
  const locationEl = document.querySelector(".job-location, .location, .job-header__location");

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
    jobTitle: titleEl?.textContent?.trim() || "Role",
    company: companyEl?.textContent?.trim() || "Company",
    jobDescription: descriptionEl?.textContent?.trim() || "",
    requirements: requirements.length > 0 ? requirements : undefined,
    location: locationEl?.textContent?.trim() || "East Africa",
    sourceUrl: window.location.href,
    sourcePlatform: "Fuzu"
  };
}

function init() {
  if (isFuzuJobDetail()) {
    const job = extractFuzuJob();
    if (job) {
      injectSidebar(job);
    }
  }

  // Inject badges on search results
  const cardSelector = ".job-card, .card-job, .listing-item, .fuzu-card, article";
  injectListingBadges(cardSelector, "h2, h3, .job-title");

  const observer = new MutationObserver(() => {
    injectListingBadges(cardSelector, "h2, h3, .job-title");
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
