"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_config_1 = __importDefault(require("../../multer/multer-config"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const account_controller_1 = require("./account.controller");
const validatation_middle_1 = require("../../middlewares/validatation.middle");
const schemas_1 = require("../../validations/schemas");
const accountRouter = (0, express_1.Router)();
accountRouter.post("/accounts/profile-pic", auth_middleware_1.authMiddleware, multer_config_1.default.single("image"), account_controller_1.updageProfilePicsController);
// update account data
accountRouter.patch("/accounts", auth_middleware_1.authMiddleware, (0, validatation_middle_1.validate)({ bodySchema: schemas_1.updateUserDataSchema }), account_controller_1.updateUserDataController);
// get user data
accountRouter.get("/accounts", auth_middleware_1.authMiddleware, account_controller_1.getUserData);
exports.default = accountRouter;
