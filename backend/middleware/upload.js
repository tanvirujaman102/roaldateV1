const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage for multer (files will be uploaded to Cloudinary manually)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'audio/mpeg', 'audio/wav'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: fileFilter,
});

// Upload function with Cloudinary integration
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'roaldate',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    ).end(file.buffer);
  });
};

// Middleware for single file upload
const uploadSingle = async (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return next(err);
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file);
        req.file.cloudinaryResult = result;
      } catch (error) {
        return next(error);
      }
    }
    next();
  });
};

// Middleware for multiple files upload
const uploadMultiple = async (req, res, next) => {
  upload.array('files', 10)(req, res, async (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      try {
        const results = await Promise.all(
          req.files.map(file => uploadToCloudinary(file))
        );
        req.files.cloudinaryResults = results;
      } catch (error) {
        return next(error);
      }
    }
    next();
  });
};

// Profile picture upload
const uploadProfilePicture = async (req, res, next) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) return next(err);
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file);
        req.file.cloudinaryResult = result;
      } catch (error) {
        return next(error);
      }
    }
    next();
  });
};

// Post media upload
const uploadPostMedia = async (req, res, next) => {
  upload.array('media', 10)(req, res, async (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      try {
        const results = await Promise.all(
          req.files.map(file => uploadToCloudinary(file))
        );
        req.files.cloudinaryResults = results;
      } catch (error) {
        return next(error);
      }
    }
    next();
  });
};

// Story media upload
const uploadStoryMedia = async (req, res, next) => {
  upload.single('media')(req, res, async (err) => {
    if (err) return next(err);
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file);
        req.file.cloudinaryResult = result;
      } catch (error) {
        return next(error);
      }
    }
    next();
  });
};

// Dating profile photos upload
const uploadDatingPhotos = async (req, res, next) => {
  upload.array('photos', 6)(req, res, async (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      try {
        const results = await Promise.all(
          req.files.map(file => uploadToCloudinary(file))
        );
        req.files.cloudinaryResults = results;
      } catch (error) {
        return next(error);
      }
    }
    next();
  });
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadProfilePicture,
  uploadPostMedia,
  uploadStoryMedia,
  uploadDatingPhotos,
  upload,
};
