import type { JobData } from "../shared/types";
import { injectSidebar, injectListingBadges } from "./injector";

export function isLinkedInJobDetail(): boolean {
  return Boolean(
    document.querySelector(".jobs-unified-top-card") ||
    document.querySelector(".job-details-jobs-unified-top-card__job-title") ||
    document.querySelector("h1.top-card-layout__title") ||
    document.querySelector("#job-details") ||
    window.location.pathname.includes("/jobs/view/")
  );
}

export function extractLinkedInJob(): JobData | null {
  const titleEl = document.querySelector(
    ".jobs-unified-top-card__job-title, h1.top-card-layout__title, .job-details-jobs-unified-top-card__job-title, h2.topcard__title, .job-details h1"
  );
  const companyEl = document.querySelector(
    ".jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name, .topcard__org-name-link, .topcard__flavor--metadata a, .job-details-jobs-unified-top-card__company-name a"
  );
  const descriptionEl = document.querySelector(
    ".jobs-description-content__text, .description__text, #job-details, .jobs-box__html-content"
  );
  const locationEl = document.querySelector(
    ".jobs-unified-top-card__bullet, .topcard__flavor--bullet, .job-details-jobs-unified-top-card__bullet"
  );

  if (!titleEl && !descriptionEl) {
    return null;
  }

  const reqElements = document.querySelectorAll("#job-details ul li, .description__text ul li");
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
    location: locationEl?.textContent?.trim() || "",
    sourceUrl: window.location.href,
    sourcePlatform: "LinkedIn"
  };
}

let lastUrl = window.location.href;

function checkAndInject() {
  if (isLinkedInJobDetail()) {
    const job = extractLinkedInJob();
    if (job) {
      injectSidebar(job);
    }
  }

  // Inject badges on search result cards
  const cardSelector = ".job-card-container, .jobs-search-results__list-item, .base-card, .job-card-list";
  injectListingBadges(cardSelector, ".job-card-list__title, h3, .base-search-card__title");
}

function init() {
  checkAndInject();

  // Watch for SPA transitions on LinkedIn
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      // remove old sidebar if navigating between jobs
      const old = document.getElementById("job-insight-sidebar-container");
      if (old) old.remove();
      setTimeout(checkAndInject, 600);
    } else {
      checkAndInject();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
