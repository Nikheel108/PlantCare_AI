import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Analysis } from './models/Analysis.js';
import { Chat } from './models/Chat.js';
import { SensorData } from './models/SensorData.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Higher limit for images

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// ─── Analysis Endpoints ──────────────────────────────────────────────────────
app.post('/api/analysis', async (req, res) => {
  try {
    const analysis = new Analysis(req.body);
    await analysis.save();
    res.status(201).json(analysis);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/analysis/:userId', async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Chat Endpoints ──────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { userId, message } = req.body;
  try {
    let chat = await Chat.findOne({ userId });
    if (chat) {
      chat.messages.push(message);
      chat.lastUpdated = Date.now();
    } else {
      chat = new Chat({ userId, messages: [message] });
    }
    await chat.save();
    res.status(200).json(chat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/chat/:userId', async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId });
    res.json(chat || { messages: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Sensor Data Endpoints ──────────────────────────────────────────────────
app.post('/api/sensors', async (req, res) => {
  try {
    const data = new SensorData(req.body);
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/sensors/:userId', async (req, res) => {
  try {
    const data = await SensorData.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(50);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
