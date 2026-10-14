import type { UserSettings } from "./types";

export const STORAGE_KEYS = {
  CV_TEXT: "job_insight_cv_text",
  CV_FILENAME: "job_insight_cv_filename",
  CV_UPDATED_AT: "job_insight_cv_updated_at",
  SETTINGS: "job_insight_settings"
} as const;

export const DEFAULT_SETTINGS: UserSettings = {
  salaryCurrency: "KES",
  notifyOnMatch: true,
  matchThreshold: 75,
  apiUrl: "http://localhost:4000",
  apiKey: "job-insight-secret-key-2024"
};

export async function setCvData(cvText: string, filename?: string): Promise<void> {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.CV_TEXT]: cvText,
      [STORAGE_KEYS.CV_FILENAME]: filename || "uploaded_resume.pdf",
      [STORAGE_KEYS.CV_UPDATED_AT]: Date.now()
    });
  }
}

export async function getCvText(): Promise<string> {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    const res = await chrome.storage.local.get(STORAGE_KEYS.CV_TEXT);
    const val = res[STORAGE_KEYS.CV_TEXT];
    return typeof val === "string" ? val : "";
  }
  return "";
}

export async function getCvMeta(): Promise<{ text: string; filename: string; updatedAt?: number }> {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    const res = await chrome.storage.local.get([
      STORAGE_KEYS.CV_TEXT,
      STORAGE_KEYS.CV_FILENAME,
      STORAGE_KEYS.CV_UPDATED_AT
    ]);
    const textVal = res[STORAGE_KEYS.CV_TEXT];
    const fileVal = res[STORAGE_KEYS.CV_FILENAME];
    const updatedVal = res[STORAGE_KEYS.CV_UPDATED_AT];

    return {
      text: typeof textVal === "string" ? textVal : "",
      filename: typeof fileVal === "string" ? fileVal : "",
      updatedAt: typeof updatedVal === "number" ? updatedVal : undefined
    };
  }
  return { text: "", filename: "" };
}

export async function clearCvData(): Promise<void> {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.remove([
      STORAGE_KEYS.CV_TEXT,
      STORAGE_KEYS.CV_FILENAME,
      STORAGE_KEYS.CV_UPDATED_AT
    ]);
  }
}

export async function getSettings(): Promise<UserSettings> {
  if (typeof chrome !== "undefined" && chrome.storage) {
    if (chrome.storage.sync) {
      try {
        const res = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
        const saved = res[STORAGE_KEYS.SETTINGS];
        if (saved && typeof saved === "object") {
          return { ...DEFAULT_SETTINGS, ...(saved as Partial<UserSettings>) };
        }
      } catch {
        // Fallback to local storage if sync fails
      }
    }
    if (chrome.storage.local) {
      try {
        const res = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
        const saved = res[STORAGE_KEYS.SETTINGS];
        if (saved && typeof saved === "object") {
          return { ...DEFAULT_SETTINGS, ...(saved as Partial<UserSettings>) };
        }
      } catch {
        // Fallback to defaults
      }
    }
  }
  return DEFAULT_SETTINGS;
}

export async function setSettings(settings: Partial<UserSettings>): Promise<void> {
  const current = await getSettings();
  const updated: UserSettings = { ...current, ...settings };
  if (typeof chrome !== "undefined" && chrome.storage) {
    if (chrome.storage.sync) {
      try {
        await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: updated });
        return;
      } catch {
        // Fallback to local
      }
    }
    if (chrome.storage.local) {
      await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
    }
  }
}
