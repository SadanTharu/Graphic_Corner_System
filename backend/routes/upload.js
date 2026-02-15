const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const { auth } = require('../middleware/auth');
const streamifier = require('streamifier');

// Configure multer to use memory storage (for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 // 50MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|mov|avi|mkv|webm|zip|rar|psd|ai/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = file.mimetype.includes('image') || 
                     file.mimetype.includes('video') || 
                     file.mimetype.includes('application');

    if (extname || mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images, videos, PDFs, archives'));
    }
  }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Upload single file
router.post('/single', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Determine resource type based on mimetype
    let resourceType = 'auto';
    if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else {
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: process.env.CLOUDINARY_FOLDER || 'graphic_corner',
      resource_type: resourceType,
      public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`,
      use_filename: true,
      unique_filename: true
    });

    res.json({
      message: 'File uploaded successfully',
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
        size: result.bytes,
        format: result.format,
        resourceType: result.resource_type,
        createdAt: result.created_at
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// Upload multiple files
router.post('/multiple', auth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(async (file) => {
      // Determine resource type
      let resourceType = 'auto';
      if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
      } else if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else {
        resourceType = 'raw';
      }

      const result = await uploadToCloudinary(file.buffer, {
        folder: process.env.CLOUDINARY_FOLDER || 'graphic_corner',
        resource_type: resourceType,
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        use_filename: true,
        unique_filename: true
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.originalname,
        size: result.bytes,
        format: result.format,
        resourceType: result.resource_type
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// Delete file from Cloudinary
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/-/g, '/');
    
    // Try deleting as different resource types
    let result;
    try {
      result = await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      // Try as video
      try {
        result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      } catch (videoError) {
        // Try as raw
        result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      }
    }

    if (result.result === 'ok') {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      message: 'Delete failed', 
      error: error.message 
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE / 1024 / 1024}MB.` 
      });
    }
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

module.exports = router;
