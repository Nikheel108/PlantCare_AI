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
  mistActive: Boolean,
  pumpDuration: Number,
  trigger: String,
  plantZone: String,
  temperature: Number,
  aqi: Number,
  status: { type: String, default: 'Completed' },
  createdAt: { type: Date, default: Date.now }
});

export const SensorData = mongoose.model('SensorData', sensorSchema);

const deviceCommandSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, index: true },
  pumpCommand: { type: String, enum: ['on', 'off', null], default: null },
  mistCommand: { type: String, enum: ['on', 'off', null], default: null },
  updatedAt: { type: Date, default: Date.now }
});

export const DeviceCommand = mongoose.model('DeviceCommand', deviceCommandSchema);
