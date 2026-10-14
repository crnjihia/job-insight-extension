import type { JobData, AnalysisResult, SessionJobRecord } from "./types";

export const enum MessageType {
  ANALYZE_REQUEST = "ANALYZE_REQUEST",
  ANALYZE_RESPONSE = "ANALYZE_RESPONSE",
  GET_CURRENT_JOB = "GET_CURRENT_JOB",
  GET_CURRENT_JOB_RESPONSE = "GET_CURRENT_JOB_RESPONSE",
  GET_SESSION_HISTORY = "GET_SESSION_HISTORY",
  GET_SESSION_HISTORY_RESPONSE = "GET_SESSION_HISTORY_RESPONSE",
  JOB_DETECTED = "JOB_DETECTED",
  CV_UPDATED = "CV_UPDATED",
  SETTINGS_UPDATED = "SETTINGS_UPDATED"
}

export interface Message<T = any> {
  type: MessageType;
  payload?: T;
}

export interface AnalyzeRequestPayload extends JobData {
  cvText?: string;
}

export interface CurrentJobResponsePayload {
  job?: JobData;
  analysis?: AnalysisResult;
  history?: SessionJobRecord[];
}
