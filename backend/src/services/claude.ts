import axios from "axios";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY ?? "";
const CLAUDE_URL = process.env.CLAUDE_API_URL ?? "https://api.anthropic.com/v1/messages";

export interface MatchScoreResult {
  matchScore: number;
  skillGaps: Array<{ skill: string; importance: number }>;
  strengths: string[];
  summary: string;
}

export async function getMatchScore(
  jobTitle: string,
  company: string,
  jobDescription: string,
  cvText: string
): Promise<MatchScoreResult> {
  const prompt = `Given this CV and job description, return JSON:
{
  "matchScore": 0-100,
  "skillGaps": [{ "skill": string, "importance": number }],
  "strengths": [string],
  "summary": string
}
Be honest — if the CV is weak for this role, score low.

CV:
"""
${cvText}
"""

Job Title: ${jobTitle}
Company: ${company}
Job Description:
"""
${jobDescription}
"""`;

  if (!CLAUDE_API_KEY) {
    return generateFallbackScore(jobTitle, jobDescription, cvText);
  }

  try {
    const response = await axios.post(
      CLAUDE_URL,
      {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        temperature: 0.1,
        system: "You are an expert technical recruiter. Output ONLY raw valid JSON adhering to the specified schema, with no markdown code fences or conversational text.",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          "x-api-key": CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const raw = response.data;
    const text = raw.content?.[0]?.text ?? "";

    // Clean up possible markdown code blocks
    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      matchScore: Math.min(100, Math.max(0, Number(parsed.matchScore) || 50)),
      skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      summary: String(parsed.summary || "Candidate alignment evaluation complete.")
    };
  } catch (err) {
    console.warn("Claude API call failed or timed out, using fallback evaluator:", err);
    return generateFallbackScore(jobTitle, jobDescription, cvText);
  }
}

/**
 * Intelligent keyword-based heuristic fallback when Claude API key is absent.
 */
function generateFallbackScore(
  jobTitle: string,
  jobDescription: string,
  cvText: string
): MatchScoreResult {
  const keywords = [
    "typescript", "javascript", "react", "node", "express", "python",
    "docker", "kubernetes", "aws", "gcp", "sql", "postgresql", "mongodb",
    "redis", "rest", "graphql", "ci/cd", "git", "linux", "testing",
    "agile", "microservices", "html", "css"
  ];

  const jdLower = (jobTitle + " " + jobDescription).toLowerCase();
  const cvLower = (cvText || "").toLowerCase();

  const requiredSkills = keywords.filter((k) => jdLower.includes(k));
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

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
    ? matchedSkills.slice(0, 5)
    : ["Relevant foundational background", "Applicable problem-solving experience"];

  const skillGaps = missingSkills.length > 0
    ? missingSkills.slice(0, 4).map((s, idx) => ({ skill: s, importance: Math.min(5, idx + 2) }))
    : [{ skill: "Domain-specific architectural scale", importance: 3 }];

  return {
    matchScore,
    skillGaps,
    strengths,
    summary: matchScore >= 75
      ? `Strong candidate fit for ${jobTitle}. The CV reflects key required technologies and domain skills.`
      : `Moderate fit for ${jobTitle}. Several core competencies align, though bridging identified skill gaps will enhance competitive standing.`
  };
}
