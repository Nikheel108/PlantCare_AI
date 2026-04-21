import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  plantName: String,
  diseaseName: String,
  confidence: String,
  severity: String,
  symptoms: [String],
  recommendations: [String],
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

export const Analysis = mongoose.model('Analysis', analysisSchema);

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  messages: [{
    id: String,
    text: String,
    sender: String,
    timestamp: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const Chat = mongoose.model('Chat', chatSchema);

const sensorSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  moisture: Number,
  isPumpActive: Boolean,
  pumpDuration: Number,
  trigger: String,
  plantZone: String,
  status: { type: String, default: 'Completed' },
  createdAt: { type: Date, default: Date.now }
});

export const SensorData = mongoose.model('SensorData', sensorSchema);
