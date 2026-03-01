const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed'));
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Process image (resize, optimize)
const processImage = async (filePath, options = {}) => {
  try {
    const { width = 800, height = 600, quality = 80 } = options;
    
    const filename = path.basename(filePath);
    const dirname = path.dirname(filePath);
    const processedPath = path.join(dirname, 'processed-' + filename);

    await sharp(filePath)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toFile(processedPath);

    // Replace original with processed
    fs.unlinkSync(filePath);
    fs.renameSync(processedPath, filePath);

    return filePath;
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
};

// Delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
};

// Get file URL
const getFileUrl = (filename) => {
  return `${process.env.BACKEND_URL}/uploads/${filename}`;
};

module.exports = {
  upload,
  processImage,
  deleteFile,
  getFileUrl
};
