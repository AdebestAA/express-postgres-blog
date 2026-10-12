import express from "express";
import authRoute from "./modules/auth-module/auth.route";
import postRoute from "./modules/post-module/post.route";
import commentRoute from "./modules/comment-module/comment.route";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/global-error.middleware";
import { nodeEnvironment } from "./constants";
import path from "path";
import accountRouter from "./modules/account/account.route";
import { asyncHandler } from "./util/async-handler";
import { createError } from "./util/create-error";
import multerUpload from "./multer/multer-config";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "./configs/r2-config";
const app = express();

import helmet from "helmet";
import { authLimiter, generalLimiter } from "./middlewares/rate-limiter";
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

// const testUploadWithFriendlyErrors = (req: any, res: any, next: any) => {
//   multerUpload.array("images", 4)(req, res, (err) => {
//     if (!err) return next();

//     console.log(err);

//     if (err instanceof multer.MulterError) {
//       if (
//         err.code === "LIMIT_FILE_COUNT" ||
//         err.code === "LIMIT_UNEXPECTED_FILE"
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "You can upload a maximum of 4 images",
//         });
//       }
//       if (err.code === "LIMIT_FILE_SIZE") {
//         return res.status(400).json({
//           success: false,
//           message: "Each image must be smaller than 2MB",
//         });
//       }
//       return res
//         .status(400)
//         .json({ success: false, message: "File upload failed" });
//     }

//     if (err instanceof Error) {
//       return res.status(400).json({ success: false, message: err.message });
//     }

//     next(err);
//   });
// };

// express middle
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin:
      nodeEnvironment === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5179",
    credentials: true,
  }),
);

const port = 8000;

// image preview
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// image upload test
// app.use("/test-uploads", testUploadWithFriendlyErrors, async (req, res) => {
//   console.log("body", req.body);
//   const imagesArray = Array.isArray(req.files) ? req.files : [];

//   console.log("FILE", req.files);
//   const imageUrls = [];

//   try {
//     for (let i = 0; i < imagesArray.length; i++) {
//       const file = imagesArray[i];

//       const key = `${crypto.randomUUID()}-${file?.originalname}`;

//       const command = new PutObjectCommand({
//         Bucket: process.env.R2_BUCKET,
//         Key: key,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//       });

//       await r2.send(command);

//       const url = `${process.env.R2_PUBLIC_URL}/${key}`;
//       imageUrls.push(url);
//     }

//     console.log(imageUrls);

//     return res.json({
//       success: true,
//       message: "image successfully uploaded",
//       images: imageUrls,
//       // files: req.files,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(500).json({ success: false, message: error.message });
//     } else {
//       return res
//         .status(500)
//         .json({ success: false, message: "something went wrong" });
//     }
//   }
// });

// other
app.get("/", (req, res) => {
  res.send("api is running");
});
app.get("/health", (req, res) => {
  res.json({ success: true, message: "healthy" });
});

app.get(
  "/test",
  asyncHandler((req, res) => {
    throw createError(404, "not found");
  }),
);

app.use(generalLimiter);

app.use("/api/auth", authLimiter, authRoute);
app.use("/api", postRoute);
app.use("/api", commentRoute);
app.use("/api", accountRouter);

app.get("/no-wrapper", async (req, res) => {
  throw new Error("boom");
});
app.get(
  "/wrapped",
  asyncHandler(async (req, res) => {
    throw new Error("boom");
  }),
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found or method not found",
  });
});

app.use(globalErrorHandler);
const startServer = async () => {
  app.listen(port, () => {
    console.log("port is running at " + port);
  });
};

startServer();
