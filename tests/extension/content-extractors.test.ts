import { expect, test, describe } from "vitest";
import { readFileSync } from "fs";
import { JSDOM } from "jsdom";

function loadFixture(path: string) {
  const html = readFileSync(path, "utf-8");
  return new JSDOM(html).window.document;
}

describe("Content Extractors Unit Tests", () => {
  test("BrighterMonday extractor extracts expected fields", () => {
    const doc = loadFixture("tests/fixtures/brightermonday-job.html");
    const titleEl = doc.querySelector("h1.job-title");
    const companyEl = doc.querySelector(".company-name a");
    const descriptionEl = doc.querySelector(".job-description");

    expect(titleEl?.textContent?.trim()).toBe("Software Engineer");
    expect(companyEl?.textContent?.trim()).toBe("TechCo Ltd");
    expect(descriptionEl?.textContent?.toLowerCase().includes("responsibilities")).toBe(true);
  });

  test("LinkedIn extractor extracts title, company, location and requirements", () => {
    const doc = loadFixture("tests/fixtures/linkedin-job.html");
    const titleEl = doc.querySelector(".jobs-unified-top-card__job-title");
    const companyEl = doc.querySelector(".jobs-unified-top-card__company-name a");
    const locationEl = doc.querySelector(".jobs-unified-top-card__bullet");
    const descriptionEl = doc.querySelector("#job-details");
    const requirements = doc.querySelectorAll("#job-details ul li");

    expect(titleEl?.textContent?.trim()).toBe("Senior Fullstack Developer");
    expect(companyEl?.textContent?.trim()).toBe("CloudScale Technologies");
    expect(locationEl?.textContent?.trim()).toContain("Nairobi");
    expect(descriptionEl?.textContent?.includes("React, TypeScript")).toBe(true);
    expect(requirements.length).toBe(3);
  });

  test("Fuzu extractor extracts title, company, and description", () => {
    const doc = loadFixture("tests/fixtures/fuzu-job.html");
    const titleEl = doc.querySelector("h1.job-title");
    const companyEl = doc.querySelector(".company-name");
    const locationEl = doc.querySelector(".job-location");
    const descriptionEl = doc.querySelector(".job-description");

    expect(titleEl?.textContent?.trim()).toBe("Backend Systems Engineer");
    expect(companyEl?.textContent?.trim()).toBe("Apex FinTech Africa");
    expect(locationEl?.textContent?.trim()).toBe("Nairobi, Kenya");
    expect(descriptionEl?.textContent?.includes("payment infrastructure")).toBe(true);
  });
});
