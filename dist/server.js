"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./modules/auth-module/auth.route"));
const post_route_1 = __importDefault(require("./modules/post-module/post.route"));
const comment_route_1 = __importDefault(require("./modules/comment-module/comment.route"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const global_error_middleware_1 = require("./middlewares/global-error.middleware");
const constants_1 = require("./constants");
const profile_route_1 = __importDefault(require("./modules/profile/profile.route"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// express middle
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: constants_1.nodeEnvironment === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5174",
    credentials: true,
}));
const port = 8800;
// image preview
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
// other
app.get("/", (req, res) => {
    res.send("api is running");
});
app.get("/health", (req, res) => {
    res.json({ success: true, message: "healthy" });
});
app.use("/api/auth", auth_route_1.default);
app.use("/api", post_route_1.default);
app.use("/api", comment_route_1.default);
app.use("/api", profile_route_1.default);
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
app.use(global_error_middleware_1.globalErrorHandler);
app.listen(port, () => {
    console.log("port is running at " + port);
});
