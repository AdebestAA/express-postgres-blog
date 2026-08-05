import { Router } from "express";
import multerUpload from "../../multer/multer-config";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  getUserData,
  updageProfilePicsController,
  updateUserDataController,
} from "./account.controller";
import { validate } from "../../middlewares/validatation.middle";
import { updateUserDataSchema } from "../../validations/schemas";

const accountRouter = Router();

accountRouter.post(
  "/accounts/profile-pic",
  authMiddleware,
  multerUpload.single("image"),
  updageProfilePicsController,
);

// update account data
accountRouter.patch(
  "/accounts",
  authMiddleware,
  validate({ bodySchema: updateUserDataSchema }),
  updateUserDataController,
);
// get user data
accountRouter.get("/accounts", authMiddleware, getUserData);

export default accountRouter;
