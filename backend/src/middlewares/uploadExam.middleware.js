import fs from "fs";
import multer from "multer";
import path from "path";

// upload directory: <project-root>/uploads/exam
const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
const QUESTION_DIR = path.join(UPLOAD_ROOT, "questions");
const EXPLANATION_DIR = path.join(UPLOAD_ROOT, "explanations");

// ensure upload directories exist
try {
  fs.mkdirSync(QUESTION_DIR, { recursive: true });
  fs.mkdirSync(EXPLANATION_DIR, { recursive: true });
} catch (err) {
  console.error("Could not create upload directories", err);
}

// configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "questionImage") cb(null, QUESTION_DIR);
    else if (file.fieldname === "explanationImage") cb(null, EXPLANATION_DIR);
    else cb(null, UPLOAD_ROOT);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

// file type filter (image only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

// 2MB default file size
const MAX_FILE_SIZE =
  process.env.MAX_FILE_SIZE
    ? parseInt(process.env.MAX_FILE_SIZE, 10)
    : 2 * 1024 * 1024;

export const uploadExamImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
