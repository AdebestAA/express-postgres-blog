import { Request, Response, Router } from "express";
import multerUpload from "../../multer/multer-config";

const profileRouter = Router();

profileRouter.post(
  "/profile/profile-pic",
  multerUpload.single("image"),
  (req: Request, res: Response) => {
    console.log(req.file);

    return res.json({ success: true });
  },
);

export default profileRouter;
