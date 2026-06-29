"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_config_1 = __importDefault(require("../../multer/multer-config"));
const profileRouter = (0, express_1.Router)();
profileRouter.post("/profile/profile-pic", multer_config_1.default.single("image"), (req, res) => {
    console.log(req.file);
    return res.json({ success: true });
});
exports.default = profileRouter;
