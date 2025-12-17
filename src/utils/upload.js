const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../../public/uploads');
const visitsDir = path.join(uploadsDir, 'visits');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(visitsDir)) {
  fs.mkdirSync(visitsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const visitId = req.params.id || req.body.visitId || 'temp';
    const visitDir = path.join(visitsDir, visitId.toString());
    
    if (!fs.existsSync(visitDir)) {
      fs.mkdirSync(visitDir, { recursive: true });
    }
    
    cb(null, visitDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Middleware for multiple photos
const uploadPhotos = upload.array('photos', 10); // Max 10 photos

// Helper to get photo URLs from visit directory
const getPhotoUrls = (visitId, baseUrl = '') => {
  const visitDir = path.join(visitsDir, visitId.toString());
  if (!fs.existsSync(visitDir)) {
    return [];
  }
  
  const files = fs.readdirSync(visitDir);
  return files
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    })
    .map(file => {
      const relativePath = `/uploads/visits/${visitId}/${file}`;
      return baseUrl ? `${baseUrl}${relativePath}` : relativePath;
    });
};

module.exports = {
  uploadPhotos,
  getPhotoUrls
};

