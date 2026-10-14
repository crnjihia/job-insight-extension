import mongoose from "mongoose";

export interface CompanyDoc extends mongoose.Document {
  name: string;
  rating: number;
  reviews: number;
  source: string;
}

const CompanySchema = new mongoose.Schema<CompanyDoc>({
  name: { type: String, required: true, unique: true },
  rating: { type: Number, required: true },
  reviews: { type: Number, required: true },
  source: { type: String, required: true }
});

export const Company = mongoose.model<CompanyDoc>("Company", CompanySchema);
