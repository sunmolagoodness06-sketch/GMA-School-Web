import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP, or PDF files are allowed'), false);
  }
};

const createStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: {
    folder: `gma-school/${folder}`,
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf']
  }
});

const admissionDocumentsUpload = multer({
  storage: createStorage('admissions'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
}).fields([
  { name: 'birthCertificate', maxCount: 1 },
  { name: 'previousSchoolRecords', maxCount: 1 },
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'medicalCertificate', maxCount: 1 }
]);

const coverLetterUpload = multer({
  storage: createStorage('careers'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
}).single('coverLetter');

const reportCardUpload = multer({
  storage: createStorage('report-cards'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
}).single('reportCard');

const studentPhotoUpload = multer({
  storage: createStorage('student-photos'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
}).single('photo');

const noticeAttachmentsUpload = multer({
  storage: createStorage('notice-attachments'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
}).array('attachments', 5);

// Wraps multer middleware so upload errors (oversized/wrong-type files)
// return a clean JSON response instead of an unhandled error.
const withUploadErrorHandling = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large. Maximum size is 5MB.'
        : err.message;
      return res.status(400).json({ success: false, message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    }
    next();
  });
};

export const uploadAdmissionDocuments = withUploadErrorHandling(admissionDocumentsUpload);
export const uploadCoverLetter = withUploadErrorHandling(coverLetterUpload);
export const uploadReportCard = withUploadErrorHandling(reportCardUpload);
export const uploadStudentPhoto = withUploadErrorHandling(studentPhotoUpload);
export const uploadNoticeAttachments = withUploadErrorHandling(noticeAttachmentsUpload);