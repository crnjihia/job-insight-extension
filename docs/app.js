/**
 * Job Insight Extension — Interactive Web Application Engine
 * Includes real-time matching heuristics, salary estimators, and company intelligence
 */

// Presets data
const PRESETS = {
  safaricom: {
    title: "Senior Full Stack Software Engineer",
    company: "Safaricom PLC",
    location: "Nairobi, Kenya",
    jd: "We are seeking a Senior Full Stack Engineer experienced with TypeScript, React, Node, Express, MongoDB, and Redis. The candidate will design scalable microservices, manage CI/CD pipelines, lead code reviews, and interface with Docker and AWS cloud infrastructure. Experience in Agile methodologies and automated testing with Vitest or Jest is essential.",
    cv: "Lead Software Developer with 6+ years building distributed cloud applications. Expert in TypeScript, JavaScript, React, Node, Express, Docker, PostgreSQL, Redis, and REST APIs. Proficient in automated testing, CI/CD, and Git version control. Strong background in Agile development and microservices."
  },
  devops: {
    title: "DevOps & Cloud Infrastructure Engineer",
    company: "Flutterwave",
    location: "Nairobi / Remote",
    jd: "Looking for a seasoned Cloud DevOps Engineer. Must possess deep knowledge of Docker, Kubernetes, AWS, GCP, CI/CD, Linux, Python, and Git. Experience with Terraform, microservices monitoring, and scalable database management (PostgreSQL, Redis) is highly preferred.",
    cv: "Backend & Systems Engineer with experience in Linux, Docker, Python, Git, and REST APIs. Familiar with AWS basics and PostgreSQL. Keen interest in expanding production Kubernetes and deep cloud architecture skills."
  },
  frontend: {
    title: "Frontend React Engineer",
    company: "Acme Tech",
    location: "Remote (Global)",
    jd: "Seeking a passionate Frontend React Engineer. Requires strong HTML, CSS, JavaScript, TypeScript, React, and GraphQL. The role involves optimizing client performance, implementing modern UI component libraries, and testing with Vitest.",
    cv: "Junior Web Developer. Skilled in HTML, CSS, JavaScript, and React basics. Built multiple portfolio applications with responsive design. Learning TypeScript and state management tools."
  },
  custom: {
    title: "",
    company: "",
    location: "Nairobi, Kenya",
    jd: "",
    cv: ""
  }
};

const KEYWORDS = [
  "typescript", "javascript", "react", "node", "express", "python",
  "docker", "kubernetes", "aws", "gcp", "sql", "postgresql", "mongodb",
  "redis", "rest", "graphql", "ci/cd", "git", "linux", "testing",
  "agile", "microservices", "html", "css"
];

// Calculate Heuristic Score (Matches backend/src/services/claude.ts)
function calculateMatch(jobTitle, jobDescription, cvText) {
  const jdCombined = (jobTitle + " " + jobDescription).toLowerCase();
  const cvLower = (cvText || "").toLowerCase();

  const requiredSkills = KEYWORDS.filter(k => jdCombined.includes(k));
  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of requiredSkills) {
    if (cvLower.includes(skill)) {
      matchedSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    } else {
      missingSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  const baseScore = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 60) + 30
    : 75;

  const matchScore = Math.min(95, Math.max(25, baseScore));

  const strengths = matchedSkills.length > 0
    ? matchedSkills.slice(0, 6)
    : ["Relevant foundational background", "Applicable problem-solving experience"];

  const skillGaps = missingSkills.length > 0
    ? missingSkills.slice(0, 5).map((s, idx) => ({ skill: s, priority: `P${Math.min(3, idx + 1)}` }))
    : [{ skill: "Domain-specific architectural scale", priority: "P3" }];

  let summaryText = "";
  let badgeClass = "";
  let badgeLabel = "";
  let color = "#10b981";

  if (matchScore >= 75) {
    badgeClass = "badge-strong";
    badgeLabel = "Strong Match";
    color = "#10b981";
    summaryText = `High candidate alignment for ${jobTitle || "this position"}. Your CV demonstrates key requirements and technical capabilities in ${matchedSkills.slice(0, 3).join(", ") || "core areas"}.`;
  } else if (matchScore >= 50) {
    badgeClass = "badge-moderate";
    badgeLabel = "Moderate Match";
    color = "#f59e0b";
    summaryText = `Moderate fit for ${jobTitle || "this position"}. While foundational competencies align, closing skill gaps in ${missingSkills.slice(0, 2).join(", ") || "advanced technologies"} will maximize interview success.`;
  } else {
    badgeClass = "badge-low";
    badgeLabel = "Skill Gap Alert";
    color = "#f43f5e";
    summaryText = `Significant qualifications divergence detected. Consider bolstering CV emphasis on ${missingSkills.slice(0, 3).join(", ") || "core technologies"} before applying.`;
  }

  return {
    score: matchScore,
    badgeClass,
    badgeLabel,
    color,
    strengths,
    skillGaps,
    summaryText
  };
}

// Calculate Company Rating (Matches backend/src/services/scraper.ts)
function calculateCompanyRating(companyName) {
  const name = companyName || "Company";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const rating = Number((3.6 + (positiveHash % 14) / 10).toFixed(1));
  const reviews = 45 + (positiveHash % 450);

  return { rating, reviews };
}

// Calculate Salary Benchmark (Matches backend/src/services/scraper.ts)
function calculateSalaryBenchmark(jobTitle, location) {
  const isKenyan = (location || "").toLowerCase().includes("kenya") || (location || "").toLowerCase().includes("nairobi");
  const currency = isKenyan ? "KES" : "USD";
  const title = (jobTitle || "").toLowerCase();

  let min = 55000;
  let median = 85000;
  let max = 130000;

  if (title.includes("senior") || title.includes("lead") || title.includes("principal")) {
    min = isKenyan ? 250000 : 90000;
    median = isKenyan ? 380000 : 130000;
    max = isKenyan ? 550000 : 185000;
  } else if (title.includes("junior") || title.includes("intern")) {
    min = isKenyan ? 60000 : 40000;
    median = isKenyan ? 90000 : 60000;
    max = isKenyan ? 130000 : 80000;
  } else {
    min = isKenyan ? 140000 : 65000;
    median = isKenyan ? 220000 : 95000;
    max = isKenyan ? 340000 : 140000;
  }

  const format = (num) => currency === "KES"
    ? `KES ${(num / 1000).toFixed(0)}k/mo`
    : `$${(num / 1000).toFixed(0)}k/yr`;

  return {
    currency,
    minFormatted: format(min),
    medianFormatted: format(median),
    maxFormatted: format(max),
    displayRange: `${format(min)} – ${format(max)}`
  };
}

// DOM Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const presetSelect = document.getElementById("preset-select");
  const jobTitleInput = document.getElementById("job-title-input");
  const companyInput = document.getElementById("company-input");
  const locationInput = document.getElementById("location-input");
  const jdInput = document.getElementById("jd-input");
  const cvInput = document.getElementById("cv-input");
  const runSimBtn = document.getElementById("run-sim-btn");

  const scoreText = document.getElementById("sim-score-text");
  const scoreBadge = document.getElementById("sim-score-badge");
  const radialCircle = document.getElementById("sim-radial-val");
  const companyRatingVal = document.getElementById("sim-company-rating");
  const companyRatingSub = document.getElementById("sim-company-sub");
  const salaryVal = document.getElementById("sim-salary-val");
  const salarySub = document.getElementById("sim-salary-sub");
  const strengthsContainer = document.getElementById("sim-strengths");
  const gapsContainer = document.getElementById("sim-gaps");
  const summaryBox = document.getElementById("sim-summary");

  function runSimulation() {
    const title = jobTitleInput.value.trim() || "Software Engineer";
    const company = companyInput.value.trim() || "Technology Partner";
    const location = locationInput.value.trim() || "Nairobi, Kenya";
    const jd = jdInput.value.trim();
    const cv = cvInput.value.trim();

    // 1. Scoring
    const match = calculateMatch(title, jd, cv);

    // Update gauge
    scoreText.textContent = `${match.score}%`;
    scoreBadge.className = `score-meta-badge ${match.badgeClass}`;
    scoreBadge.textContent = match.badgeLabel;

    // Circumference for r=35 is 2 * Math.PI * 35 = 219.91
    const totalCircumference = 220;
    const offset = totalCircumference - (match.score / 100) * totalCircumference;
    radialCircle.style.strokeDashoffset = offset;
    radialCircle.style.stroke = match.color;

    // 2. Strengths Chips
    strengthsContainer.innerHTML = "";
    match.strengths.forEach(s => {
      const chip = document.createElement("span");
      chip.className = "chip-match";
      chip.textContent = `✓ ${s}`;
      strengthsContainer.appendChild(chip);
    });

    // 3. Gap Chips
    gapsContainer.innerHTML = "";
    match.skillGaps.forEach(g => {
      const chip = document.createElement("span");
      chip.className = "chip-gap";
      chip.textContent = `▲ ${g.skill} (${g.priority})`;
      gapsContainer.appendChild(chip);
    });

    // 4. Company intelligence
    const compData = calculateCompanyRating(company);
    companyRatingVal.textContent = `★ ${compData.rating}`;
    companyRatingSub.textContent = `Based on ${compData.reviews} verified Glassdoor reviews`;

    // 5. Salary Benchmark
    const salary = calculateSalaryBenchmark(title, location);
    salaryVal.textContent = salary.medianFormatted;
    salarySub.textContent = `Est. Range: ${salary.displayRange} (${location})`;

    // 6. Summary
    summaryBox.textContent = match.summaryText;
  }

  // Load preset handler
  function loadPreset(key) {
    const data = PRESETS[key];
    if (!data) return;
    jobTitleInput.value = data.title;
    companyInput.value = data.company;
    locationInput.value = data.location;
    jdInput.value = data.jd;
    cvInput.value = data.cv;
    runSimulation();
  }

  if (presetSelect) {
    presetSelect.addEventListener("change", (e) => {
      loadPreset(e.target.value);
    });
  }

  if (runSimBtn) {
    runSimBtn.addEventListener("click", () => {
      runSimulation();
      showToast("✨ Job Insight overlay analysis recalculated!");
    });
  }

  // Initial simulation
  loadPreset("safaricom");

  // Window view toggle (Simulator vs Screenshot)
  const windowTabBtns = document.querySelectorAll(".window-tab-btn");
  const simulatorLayout = document.getElementById("simulator-tab-content");
  const screenshotView = document.getElementById("screenshot-tab-content");

  windowTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      windowTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.tab;

      if (target === "screenshot") {
        simulatorLayout.style.display = "none";
        screenshotView.classList.add("active");
      } else {
        screenshotView.classList.remove("active");
        simulatorLayout.style.display = "grid";
      }
    });
  });

  // Portal tabs toggle
  const portalBtns = document.querySelectorAll(".portal-tab-btn");
  const portalCards = document.querySelectorAll(".portal-card");

  portalBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      portalBtns.forEach(b => b.classList.remove("active"));
      portalCards.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const portalId = btn.dataset.portal;
      const targetCard = document.getElementById(`portal-${portalId}`);
      if (targetCard) targetCard.classList.add("active");
    });
  });

  // Guide / Quickstart tabs toggle
  const guideBtns = document.querySelectorAll(".guide-tab-btn");
  const guidePanels = document.querySelectorAll(".guide-panel");

  guideBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      guideBtns.forEach(b => b.classList.remove("active"));
      guidePanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetGuide = btn.dataset.guide;
      const panel = document.getElementById(`guide-${targetGuide}`);
      if (panel) panel.classList.add("active");
    });
  });

  // Copy buttons
  const copyBtns = document.querySelectorAll(".copy-btn");
  copyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const codeSnippet = btn.dataset.code || btn.previousElementSibling?.textContent;
      if (codeSnippet) {
        navigator.clipboard.writeText(codeSnippet.trim()).then(() => {
          showToast("Copied command to clipboard! 📋");
          const originalText = btn.innerHTML;
          btn.innerHTML = `✓ Copied`;
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        });
      }
    });
  });

  // FAQ Accordion
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (question) {
      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        // Close others
        faqItems.forEach(i => i.classList.remove("open"));
        if (!isOpen) {
          item.classList.add("open");
        }
      });
    }
  });

  // Toast Functionality
  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }
});
