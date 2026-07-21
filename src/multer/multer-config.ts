import multer from "multer";

const storage = multer.diskStorage({
  // this is for saving file directly
  // destination: (req, file, cb) => {
  //   // console.log("req", req);
  //   console.log("file", file);

  //   cb(null, "uploads/");
  // },
  filename: (req, file, cb) => {
    const addPrefix = Math.floor(Math.random() * Math.pow(2, 10)) + Date.now();
    cb(null, addPrefix + file.originalname);
  },
});

const multerUpload = multer({
  storage: multer.memoryStorage(),
  // limits: {
  //   fileSize: 2 * Math.pow(2, 20),
  // },
});

export default multerUpload;
