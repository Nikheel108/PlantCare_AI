import mongoose from 'mongoose';

const sensorDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  moisture: { type: Number, required: true },
  isPumpActive: { type: Boolean, default: false },
  pumpDuration: { type: Number, default: 0 },
  trigger: { type: String, enum: ['Auto', 'Manual', 'Schedule'], default: 'Auto' },
  status: { type: String, default: 'Completed' },
  plantZone: { type: String, default: 'Default Zone' },
  createdAt: { type: Date, default: Date.now }
});

export const SensorData = mongoose.model('SensorData', sensorDataSchema);
