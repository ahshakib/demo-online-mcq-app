import fs from "fs";
import multer from "multer";
import path from "path";

// upload directory: <project-root>/uploads/profile
const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
const PROFILE_DIR = path.join(UPLOAD_ROOT, "profile");

// ensure upload directories exist
try {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
} catch (err) {
  // if we can't create directories, multer will surface an error later
  console.error("Could not create upload directory", err);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file && file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

// default max size 2MB, can be overridden by env var MAX_FILE_SIZE
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE, 10) : 2 * 1024 * 1024;

export const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });
