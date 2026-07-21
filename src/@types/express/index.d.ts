import "express-serve-static-core";
import "multer";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      email: string;
    };
    file: Express.Multer.File;
  }
}
