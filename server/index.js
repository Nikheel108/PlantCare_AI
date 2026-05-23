import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Analysis, Chat, SensorData } from './models.js';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images

// Simple API key middleware for device POSTs
function requireApiKey(req, res, next) {
  const key = req.header('x-api-key') || '';
  if (key && process.env.SENSOR_API_KEY && key === process.env.SENSOR_API_KEY) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Ensure your IP is whitelisted in MongoDB Atlas and the URI is correct.');
  });

// --- API Routes ---

// 1. Plant Analysis
app.post('/api/analysis', async (req, res) => {
  const { userId, userEmail, image, ...analysisData } = req.body;
  
  try {
    let imageUrl = analysisData.imageUrl;

    // Upload to Cloudinary if base64 image is provided
    if (image && image.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'plantcare_analysis',
      });
      imageUrl = uploadResponse.secure_url;
    }

    const analysis = new Analysis({
      userId,
      ...analysisData,
      imageUrl
    });
    
    // Attempt to save to DB (don't let it block the email if it hangs)
    const dbSavePromise = analysis.save()
      .then(() => console.log('Analysis saved to database'))
      .catch(err => console.error('Database save error:', err));

    // Send Email if userEmail is provided
    let emailSent = false;
    if (userEmail) {
      try {
        const mailOptions = {
          from: `PlantCare AI <${process.env.SMTP_USER}>`,
          to: userEmail,
          subject: `Plant Analysis Report: ${analysisData.diseaseName || 'Result'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
              <div style="background: #2e7d32; color: white; padding: 20px; text-align: center;">
                <h1>PlantCare AI Report</h1>
              </div>
              <div style="padding: 20px;">
                <h2>Analysis Summary</h2>
                <p><strong>Plant:</strong> ${analysisData.plantName || 'Unknown'}</p>
                <p><strong>Diagnosis:</strong> ${analysisData.diseaseName}</p>
              <p><strong>Confidence:</strong> ${analysisData.confidence}</p>
              <p><strong>Severity:</strong> ${analysisData.severity}</p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 15px;">
                <p><strong>Description:</strong> ${analysisData.description || 'No description provided.'}</p>
              </div>

              <h3>Observed Symptoms:</h3>
              <ul>
                ${(analysisData.symptoms || []).map(s => `<li>${s}</li>`).join('')}
              </ul>

              <h3>Possible Causes:</h3>
              <ul>
                ${(analysisData.causes || []).map(c => `<li>${c}</li>`).join('')}
              </ul>
              
              <h3>Recommended Treatment:</h3>
              <ul>
                ${(analysisData.recommendations || []).map(rec => `<li>${rec}</li>`).join('')}
              </ul>

              <h3>Prevention Tips:</h3>
              <ul>
                ${(analysisData.prevention || []).map(p => `<li>${p}</li>`).join('')}
              </ul>

              ${analysisData.additionalNotes ? `
                <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 15px; border-left: 5px solid #2196f3;">
                  <p><strong>Additional Notes:</strong> ${analysisData.additionalNotes}</p>
                </div>
              ` : ''}
              
              ${imageUrl ? `<div style="text-align: center; margin-top: 20px;">
                <img src="${imageUrl}" alt="Analyzed Plant" style="max-width: 100%; border-radius: 5px; border: 1px solid #ddd;" />
              </div>` : ''}
                
                <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
                  Thank you for using PlantCare AI to take care of your plants!
                </p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        emailSent = true;
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    // Wait for DB save to complete before responding, but with a timeout
    await Promise.race([
      dbSavePromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database operation timed out')), 8000))
    ]).catch(err => console.error('DB Operation failed or timed out:', err.message));

    res.status(201).json({
      ...analysis.toObject(),
      emailSent
    });
  } catch (err) {
    console.error('Analysis endpoint error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analysis/:userId', async (req, res) => {
  try {
    const results = await Analysis.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Chat History
app.post('/api/chat', async (req, res) => {
  const { userId, message } = req.body;
  try {
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [message] });
    } else {
      chat.messages.push(message);
      chat.updatedAt = Date.now();
    }
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/chat/:userId', async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId });
    res.json(chat || { messages: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Sensor Data
app.post('/api/sensors', requireApiKey, async (req, res) => {
  try {
    const data = new SensorData(req.body);
    await data.save();
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/sensors/:userId', async (req, res) => {
  try {
    const results = await SensorData.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Convenience endpoint: latest sensor document for a userId
app.get('/api/sensors/latest/:userId', async (req, res) => {
  try {
    const doc = await SensorData.findOne({ userId: req.params.userId }).sort({ createdAt: -1 });
    if (!doc) return res.status(404).json({ error: 'No data' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
