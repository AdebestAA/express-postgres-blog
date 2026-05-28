import express from "express";
import authRoute from "./modules/auth-module/auth.route";
import postRoute from "./modules/post-module/post.route";
import jwt from "jsonwebtoken";
import commentRoute from "./modules/comment-module/comment.route";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/global-error.middleware";
const app = express();

app.use(express.json());
app.use(cookieParser());

const port = 8800;

// express middle

app.use("/api/auth", authRoute);
app.use("/api", postRoute);
app.use("/api", commentRoute);
app.get("/health", (req, res) => {
  res.json({ succuss: true });
});

app.post("/decrypt", (req, res) => {
  const token = req.body.token;

  try {
    const verifyToken = jwt.verify(token, "secret-key");

    console.log(verifyToken, "verify token");
    res.json({ success: true });
  } catch (error) {
    const err = error instanceof Error ? error.message : "nothing";
    console.log(err, "exp");
    res.json({ success: true });
  }
});
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
