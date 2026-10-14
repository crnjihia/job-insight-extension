import mongoose from "mongoose";

export interface SalaryDoc extends mongoose.Document {
  title: string;
  location?: string;
  min: number;
  median: number;
  max: number;
  currency: string;
}

const SalarySchema = new mongoose.Schema<SalaryDoc>({
  title: { type: String, required: true },
  location: { type: String },
  min: { type: Number, required: true },
  median: { type: Number, required: true },
  max: { type: Number, required: true },
  currency: { type: String, required: true }
});

export const Salary = mongoose.model<SalaryDoc>("Salary", SalarySchema);
