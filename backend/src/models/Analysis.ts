import mongoose from "mongoose";

export interface AnalysisDoc extends mongoose.Document {
  hashKey: string; // sha256(jobDesc+cv)
  result: any; // JSON from Claude
  createdAt: Date;
}

const AnalysisSchema = new mongoose.Schema<AnalysisDoc>({
  hashKey: { type: String, required: true, unique: true },
  result: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Analysis = mongoose.model<AnalysisDoc>("Analysis", AnalysisSchema);
