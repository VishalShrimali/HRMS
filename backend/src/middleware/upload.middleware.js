import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      const sanitizedName = basename.replace(/[^a-zA-Z0-9]/g, '-');
      const uniqueName = `${Date.now()}-${sanitizedName}${ext}`;
      cb(null, uniqueName);
    } catch (error) {
      cb(error);
    }
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

// Create the Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1,
  }
});

// Export the Multer instance as default
export default upload;

// Optionally export the custom middleware separately if needed
export const uploadErrorHandler = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message: 'Upload error',
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        message: 'Invalid file',
        error: err.message
      });
    }
    next();
  });
};