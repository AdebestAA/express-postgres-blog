"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
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
const multerUpload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 2 * Math.pow(2, 20),
    },
});
exports.default = multerUpload;
