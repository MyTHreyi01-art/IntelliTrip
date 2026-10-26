import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads/images');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();

// @desc    Upload an image from client file input (Base64 or multipart)
// @route   POST /api/v1/upload
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { image, fileName } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    // Expect base64 data e.g. "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
    let matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let extension = '.jpg';
    let buffer;

    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      if (mimeType.includes('png')) extension = '.png';
      else if (mimeType.includes('webp')) extension = '.webp';
      else if (mimeType.includes('gif')) extension = '.gif';
      else if (mimeType.includes('svg')) extension = '.svg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const cleanBaseName = (fileName || 'upload')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueFileName = `${cleanBaseName}_${Date.now()}${extension}`;
    const destinationPath = path.join(uploadDir, uniqueFileName);

    fs.writeFileSync(destinationPath, buffer);

    const relativeUrl = `/images/${uniqueFileName}`;

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully from local device',
      url: relativeUrl,
      fileName: uniqueFileName
    });
  } catch (error) {
    next(error);
  }
});

// @desc    List all locally downloaded images available in uploads/images folder
// @route   GET /api/v1/upload/available
// @access  Private
router.get('/available', protect, async (req, res, next) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const files = fs
      .readdirSync(uploadDir)
      .filter((file) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file))
      .map((file) => ({
        name: file,
        url: `/images/${file}`
      }));

    res.json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    next(error);
  }
});

export default router;

