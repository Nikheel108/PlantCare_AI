import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  plantName: { type: String, default: 'Unknown Plant' },
  diseaseName: { type: String, required: true },
  confidence: { type: String },
  severity: { type: String },
  description: { type: String },
  symptoms: [String],
  causes: [String],
  treatment: [String],
  prevention: [String],
  additionalNotes: { type: String },
  imageUrl: { type: String }, // Store base64 or URL
  createdAt: { type: Date, default: Date.now }
});

export const Analysis = mongoose.model('Analysis', analysisSchema);
