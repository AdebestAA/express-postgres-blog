import multer from "multer";

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const addPrefix = Math.floor(Math.random() * Math.pow(2, 10)) + Date.now();
    cb(null, addPrefix + file.originalname);
  },
});

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // this for 2mb
    fileSize: 2 * Math.pow(2, 20),
  },
});

export default multerUpload;
