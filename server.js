const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config();

const app = express();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer for file uploads (temporary storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON
app.use(express.json());

// Routes

// Health check – verifies the server is running and the DB is reachable
app.get('/health', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'error', database: 'unreachable', message: 'Database connection failed' });
  }
});

const uploadImageToCloudinary = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({
    resource_type: 'image',
    folder: 'applications',
  }, (error, result) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(result);
  });
  stream.end(buffer);
});

// Submit application
app.post('/submit', upload.fields([{ name: 'image1' }, { name: 'image2' }]), async (req, res) => {
  try {
    const { firstName, lastName, description } = req.body;
    const image1File = req.files?.image1?.[0];
    const image2File = req.files?.image2?.[0];

    if (!firstName || !lastName || !description) {
      return res.status(400).json({ error: 'First name, last name, and description are required.' });
    }

    if (!image1File || !image2File) {
      return res.status(400).json({ error: 'Both images are required.' });
    }

    // Upload images to Cloudinary
    const [image1Result, image2Result] = await Promise.all([
      uploadImageToCloudinary(image1File.buffer),
      uploadImageToCloudinary(image2File.buffer),
    ]);

    // Save to database
    const applicant = await prisma.applicant.create({
      data: {
        firstName,
        lastName,
        description,
        image1Url: image1Result.secure_url,
        image2Url: image2Result.secure_url,
      },
    });

    res.status(201).json({ message: 'Application submitted successfully', applicant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get all applications
app.get('/applications', async (req, res) => {
  try {
    const applications = await prisma.applicant.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
