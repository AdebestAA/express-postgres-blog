import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log("req", req);
    // console.log("file", file);
    // console.log("cb", cb);
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const addPrefix = Math.floor(Math.random() * Math.pow(2, 10)) + Date.now();
    cb(null, addPrefix + file.originalname);
  },
});

const multerUpload = multer({
  storage,
  limits: {
    fileSize: 2 * Math.pow(2, 20),
  },
});

export default multerUpload;
