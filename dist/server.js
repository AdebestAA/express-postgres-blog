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
const path_1 = __importDefault(require("path"));
const account_route_1 = __importDefault(require("./modules/account/account.route"));
const async_handler_1 = require("./util/async-handler");
const create_error_1 = require("./util/create-error");
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
const port = 1000;
// image preview
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
// other
app.get("/", (req, res) => {
    res.send("api is running");
});
app.get("/health", (req, res) => {
    res.json({ success: true, message: "healthy" });
});
app.get("/test", (0, async_handler_1.asyncHandler)((req, res) => {
    throw (0, create_error_1.createError)(404, "not found");
}));
app.use("/api/auth", auth_route_1.default);
app.use("/api", post_route_1.default);
app.use("/api", comment_route_1.default);
app.use("/api", account_route_1.default);
// lab 1
app.get("/lab1", (0, async_handler_1.asyncHandler)((req, res) => {
    throw (0, create_error_1.createError)(418, "teapot");
}));
// lab 2
app.get("/lab2", (0, async_handler_1.asyncHandler)((req, res) => {
    try {
        throw (0, create_error_1.createError)(418, "teapot");
    }
    catch (error) {
        const err = error instanceof Error ? error.message : "something is went wrong";
        // res.status(500).json({ message: (error as Error).message });
        // res.status(500).json({ message: err });
        throw error;
    }
}));
app.get("/lab3", (0, async_handler_1.asyncHandler)((req, res) => {
    try {
        try {
            throw (0, create_error_1.createError)(400, "first error");
        }
        catch (error) {
            throw (0, create_error_1.createError)(500, "re-thrown from inner catch"); // where does THIS go?
        }
    }
    catch (error) {
        res.status(200).json({ message: error.message }); // → here! (the OUTER catch)
    }
}));
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
