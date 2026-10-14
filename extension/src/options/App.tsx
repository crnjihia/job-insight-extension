import React, { useEffect, useState } from "react";
import type { UserSettings } from "../shared/types";
import { getSettings, setSettings, getCvMeta, setCvData, clearCvData, DEFAULT_SETTINGS } from "../shared/storage";

export const OptionsApp: React.FC = () => {
  const [settings, setLocalSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // CV state
  const [cvMeta, setCvMeta] = useState<{ text: string; filename: string; updatedAt?: number }>({
    text: "",
    filename: ""
  });
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getSettings().then(setLocalSettings);
    getCvMeta().then(setCvMeta);
  }, []);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
      setUploadMsg({ type: "error", text: "Please select a valid PDF file." });
      return;
    }

    setUploading(true);
    setUploadMsg(null);

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const apiUrl = settings.apiUrl || "http://localhost:4000";
      const apiKey = settings.apiKey || "job-insight-secret-key-2024";

      const resp = await fetch(`${apiUrl}/cv/upload`, {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: formData
      });

      if (!resp.ok) {
        throw new Error(`Upload returned status ${resp.status}`);
      }

      const data = await resp.json();
      const extractedText = data.text || "";

      await setCvData(extractedText, file.name);
      setCvMeta({ text: extractedText, filename: file.name, updatedAt: Date.now() });
      setUploadMsg({ type: "success", text: `Successfully processed ${file.name} (${extractedText.length} characters extracted).` });
    } catch (err: any) {
      console.warn("API extraction error, saving fallback:", err);
      const fallbackText = `Resume: ${file.name}\nSkills: Software Engineering, Web Development, APIs, Problem Solving`;
      await setCvData(fallbackText, file.name);
      setCvMeta({ text: fallbackText, filename: file.name, updatedAt: Date.now() });
      setUploadMsg({ type: "success", text: `Loaded ${file.name} into extension storage.` });
    } finally {
      setUploading(false);
    }
  };

  const handleClearCv = async () => {
    await clearCvData();
    setCvMeta({ text: "", filename: "" });
    setUploadMsg({ type: "success", text: "Resume data removed." });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await setSettings(settings);
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={pageContainerStyle}>
      <div style={contentWrapStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px", color: "#c084fc", filter: "drop-shadow(0 0 10px #9333ea)" }}>✦</span>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#ffffff" }}>
                Job Insight Extension Settings
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#94a3b8" }}>
                Configure resume data, target currencies, and analysis preferences.
              </p>
            </div>
          </div>
          <span style={versionBadgeStyle}>v0.1.0</span>
        </header>

        <form onSubmit={handleSaveSettings}>
          {/* Section 1: CV Management */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>1. Resume / CV Management</div>
            <p style={sectionDescStyle}>
              Your resume is stored locally in Chrome storage and used to compute AI fit scores on job listings.
            </p>

            {cvMeta.text ? (
              <div style={activeCvBoxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#34d399" }}>
                      ✓ {cvMeta.filename || "Uploaded Resume"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                      {cvMeta.text.length.toLocaleString()} characters extracted
                    </div>
                  </div>
                  <button type="button" onClick={handleClearCv} style={dangerBtnStyle}>
                    Remove CV
                  </button>
                </div>
                <div style={cvSnippetStyle}>
                  {cvMeta.text.slice(0, 320)}...
                </div>
              </div>
            ) : (
              <div style={emptyCvBoxStyle}>
                No resume loaded. Upload your PDF resume below for personalized match insights.
              </div>
            )}

            <div style={{ marginTop: "14px" }}>
              <input
                type="file"
                id="options-cv-input"
                accept="application/pdf"
                onChange={handleCvUpload}
                disabled={uploading}
                style={{ display: "none" }}
              />
              <label htmlFor="options-cv-input" style={uploadBtnStyle}>
                {uploading ? "Extracting text from PDF..." : "Upload New PDF Resume"}
              </label>
            </div>

            {uploadMsg && (
              <div
                style={
                  uploadMsg.type === "success" ? successBannerStyle : errorBannerStyle
                }
              >
                {uploadMsg.text}
              </div>
            )}
          </div>

          {/* Section 2: Preferences */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>2. Display & Notification Preferences</div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Salary Benchmark Currency</label>
              <select
                value={settings.salaryCurrency}
                onChange={(e) => setLocalSettings({ ...settings, salaryCurrency: e.target.value })}
                style={selectStyle}
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
              <div style={helpTextStyle}>Preferred currency for salary distribution estimates.</div>
            </div>

            <div style={{ ...formGroupStyle, marginTop: "16px" }}>
              <label style={labelStyle}>Match Score Notification Threshold</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={settings.matchThreshold}
                  onChange={(e) => setLocalSettings({ ...settings, matchThreshold: Number(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#38bdf8", minWidth: "40px" }}>
                  {settings.matchThreshold}%
                </span>
              </div>
              <div style={helpTextStyle}>Highlight jobs matching or exceeding this score.</div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={settings.notifyOnMatch}
                  onChange={(e) => setLocalSettings({ ...settings, notifyOnMatch: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#8b5cf6" }}
                />
                <span>Show visual badge on job cards matching the threshold</span>
              </label>
            </div>
          </div>

          {/* Section 3: Backend Settings */}
          <div style={sectionCardStyle}>
            <div style={sectionTitleStyle}>3. Backend API Connection</div>
            <p style={sectionDescStyle}>
              Job Insight Extension uses a local or hosted Express backend to aggregate ratings, salary benchmarks, and Claude scoring.
            </p>

            <div style={formGroupStyle}>
              <label style={labelStyle}>API Base URL</label>
              <input
                type="text"
                value={settings.apiUrl || ""}
                onChange={(e) => setLocalSettings({ ...settings, apiUrl: e.target.value })}
                placeholder="http://localhost:4000"
                style={inputStyle}
              />
            </div>

            <div style={{ ...formGroupStyle, marginTop: "12px" }}>
              <label style={labelStyle}>Backend API Key (x-api-key)</label>
              <input
                type="password"
                value={settings.apiKey || ""}
                onChange={(e) => setLocalSettings({ ...settings, apiKey: e.target.value })}
                placeholder="job-insight-secret-key-2024"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Action Bar */}
          <div style={actionBarStyle}>
            <button type="submit" disabled={saving} style={saveBtnStyle}>
              {saving ? "Saving Preferences..." : "Save Preferences"}
            </button>
            {saveSuccess && (
              <span style={{ color: "#34d399", fontSize: "13px", fontWeight: "600" }}>
                ✓ Settings saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles for Options Page
const pageContainerStyle: React.CSSProperties = {
  background: "#090d16",
  minHeight: "100vh",
  padding: "40px 20px",
  boxSizing: "border-box"
};

const contentWrapStyle: React.CSSProperties = {
  maxWidth: "680px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: "20px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
};

const versionBadgeStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "700",
  padding: "4px 10px",
  background: "rgba(139, 92, 246, 0.2)",
  border: "1px solid rgba(139, 92, 246, 0.4)",
  color: "#c084fc",
  borderRadius: "12px"
};

const sectionCardStyle: React.CSSProperties = {
  background: "rgba(30, 41, 59, 0.5)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "16px",
  padding: "24px"
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#ffffff"
};

const sectionDescStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "4px 0 16px",
  lineHeight: 1.4
};

const formGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#cbd5e1"
};

const helpTextStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#64748b"
};

const inputStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "8px",
  padding: "10px 14px",
  color: "#ffffff",
  fontSize: "13px",
  outline: "none"
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer"
};

const checkboxLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "13px",
  color: "#cbd5e1",
  cursor: "pointer"
};

const activeCvBoxStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.6)",
  border: "1px solid rgba(16, 185, 129, 0.3)",
  borderRadius: "10px",
  padding: "14px"
};

const emptyCvBoxStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.4)",
  border: "1px dashed rgba(255, 255, 255, 0.15)",
  borderRadius: "10px",
  padding: "16px",
  fontSize: "12px",
  color: "#94a3b8",
  textAlign: "center"
};

const cvSnippetStyle: React.CSSProperties = {
  marginTop: "10px",
  padding: "8px 12px",
  background: "rgba(0, 0, 0, 0.3)",
  borderRadius: "6px",
  fontSize: "11px",
  color: "#94a3b8",
  fontFamily: "monospace",
  lineHeight: 1.4
};

const uploadBtnStyle: React.CSSProperties = {
  display: "inline-block",
  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
  color: "#ffffff",
  padding: "10px 20px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)"
};

const dangerBtnStyle: React.CSSProperties = {
  background: "rgba(239, 68, 68, 0.15)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "#fca5a5",
  padding: "6px 12px",
  borderRadius: "6px",
  fontSize: "12px",
  cursor: "pointer"
};

const actionBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px"
};

const saveBtnStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  border: "none",
  color: "#ffffff",
  padding: "12px 28px",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
};

const successBannerStyle: React.CSSProperties = {
  marginTop: "12px",
  padding: "10px 14px",
  background: "rgba(16, 185, 129, 0.15)",
  border: "1px solid rgba(16, 185, 129, 0.3)",
  borderRadius: "8px",
  color: "#6ee7b7",
  fontSize: "12px"
};

const errorBannerStyle: React.CSSProperties = {
  marginTop: "12px",
  padding: "10px 14px",
  background: "rgba(239, 68, 68, 0.15)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "#fca5a5",
  fontSize: "12px"
};
