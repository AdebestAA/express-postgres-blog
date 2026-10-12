import { NextFunction, Request, Response } from "express";
import {
  createCommentSchema,
  createCommentType,
  createPostSchema,
  createPostType,
  editPostSchema,
  emailVerifySchema,
  emailVerifyType,
  signInSchema,
  signinType,
  signUpSchema,
  signupType,
} from "../validations/schemas";
import { dynamicSchema } from "../constants";
import { ZodSchema } from "zod";
import { z } from "zod";
import multerUpload from "../multer/multer-config";
import multer from "multer";

// signup validation middleware
export const validationMiddleWare = async (
  req: Request<{}, {}, signupType>,
  res: Response,
  next: NextFunction,
) => {
  //   console.log(req.body);

  const verifyResult = dynamicSchema(signUpSchema, req.body);

  if (verifyResult.success && verifyResult.data) {
    req.body = verifyResult.data;
    next();
  } else {
    res.status(400).json(verifyResult);
  }
};

// sign in validation check
export const signinValidationMiddleWare = (
  req: Request<{}, {}, signinType>,
  res: Response,
  next: NextFunction,
) => {
  const verifyResult = dynamicSchema(signInSchema, req.body);

  if (verifyResult.success && verifyResult.data) {
    req.body = verifyResult.data;
    next();
  } else {
    res.status(400).json(verifyResult);
  }
};
export const emailVerifyValidationMiddleWare = (
  req: Request<{}, {}, emailVerifyType>,
  res: Response,
  next: NextFunction,
) => {
  //   console.log(req.body);

  const verifyResult = dynamicSchema(emailVerifySchema, req.body);

  if (verifyResult.success && verifyResult.data) {
    req.body = verifyResult.data;
    next();
  } else {
    res.status(400).json(verifyResult);
  }
};
// create post validation
export const createPostValidationMiddleWare = (
  req: Request<{}, {}, createPostType>,
  res: Response,
  next: NextFunction,
) => {
  console.log(req.body);
  // console.log(req.body);

  const verifyResult = dynamicSchema(createPostSchema, req.body);

  if (verifyResult.success && verifyResult.data) {
    req.body = verifyResult.data;
    next();
  } else {
    res.status(400).json(verifyResult);
  }
};

// create comment validation
export const createCommentValidationMiddleWare = (
  req: Request<{}, {}, createCommentType>,
  res: Response,
  next: NextFunction,
) => {
  //   console.log(req.body);

  const verifyResult = dynamicSchema(createCommentSchema, req.body);

  if (verifyResult.success && verifyResult.data) {
    req.body = verifyResult.data;
    next();
  } else {
    res.status(400).json(verifyResult);
  }
};

export const editPostValidation = async (
  req: Request<{ id: string }, {}, { content: string }>,
  res: Response,
  next: NextFunction,
) => {
  if (!req?.params?.id || !req?.body?.content) {
    return res.status(400).json({ success: false, message: "field required" });
  }
  const paramAndbody = {
    post_id: req.params.id,
    content: req.body.content,
  };
  const verifyResult = dynamicSchema(editPostSchema, paramAndbody);

  if (verifyResult.success && verifyResult.data) {
    req.body = { content: verifyResult.data.content };
    req.params = { id: verifyResult.data.post_id };
    next();
  } else {
    res.status(400).json(verifyResult);
  }
};

// dyammmic validate

export const validate =
  <T>(schemas: { bodySchema?: ZodSchema<T>; paramsSchema?: ZodSchema<T> }) =>
  (
    req: Request<{}, {}, z.infer<typeof schemas.bodySchema>>,
    res: Response,
    next: NextFunction,
  ) => {
    if (schemas.bodySchema) {
      const result = schemas.bodySchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error.issues[0].message,
        });
      }

      req.body = result.data;
    }

    if (schemas.paramsSchema) {
      const result = schemas.paramsSchema.safeParse(req.params);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error.issues[0].message,
        });
      }

      req.body = result.data;
    }
    next();
  };

export const postImagesMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  multerUpload.array("images", 4)(req, res, (err) => {
    if (!err) return next();

    console.log(err);

    if (err instanceof multer.MulterError) {
      if (
        err.code === "LIMIT_FILE_COUNT" ||
        err.code === "LIMIT_UNEXPECTED_FILE"
      ) {
        return res.status(400).json({
          success: false,
          message: "You can upload a maximum of 4 images",
        });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Each image must be smaller than 2MB",
        });
      }
      return res
        .status(400)
        .json({ success: false, message: "File upload failed" });
    }

    if (err instanceof Error) {
      return res.status(400).json({ success: false, message: err.message });
    }

    next(err);
  });
};
