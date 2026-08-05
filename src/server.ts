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
import { success } from "zod";
import { asyncHandler } from "./util/async-handler";
import { error } from "console";
import { createError } from "./util/create-error";
const app = express();

// express middle
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin:
      nodeEnvironment === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5174",
    credentials: true,
  }),
);

const port = 8800;

// image preview
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
    return res.status(200).json({ success: true, message: "it working" });
  }),
);
// app.get("/test", async (req, res) => {
//   try {
//     throw new Error("not working");
//     return res.status(200).json({ success: true, message: "it working" });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({
//         success: false,
//         message: error instanceof Error ? error.message : "some went wrong",
//       });
//   }
// });
app.use("/api/auth", authRoute);
app.use("/api", postRoute);
app.use("/api", commentRoute);
app.use("/api", accountRouter);
app.get("/health", (req, res) => {
  res.json({ succuss: true });
});

// app.post("/decrypt", (req, res) => {
//   const token = req.body.token;

//   try {
//     const verifyToken = jwt.verify(token, "secret-key");

//     console.log(verifyToken, "verify token");
//     res.json({ success: true });
//   } catch (error) {
//     const err = error instanceof Error ? error.message : "nothing";
//     console.log(err, "exp");
//     res.json({ success: true });
//   }
// });

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found or method not found",
  });
});

app.use(globalErrorHandler);
app.listen(port, () => {
  console.log("port is running at " + port);
});
