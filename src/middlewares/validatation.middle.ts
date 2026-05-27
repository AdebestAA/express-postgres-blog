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
    res.status(401).json(verifyResult);
  }
};

// sign in validation check
export const signinValidationMiddleWare = (
  req: Request<{}, {}, signinType>,
  res: Response,
  next: NextFunction,
) => {
  console.log(req.body, "data not coming");

  const verifyResult = dynamicSchema(signInSchema, req.body);
  console.log(verifyResult);

  if (verifyResult.success && verifyResult.data) {
    req.body = verifyResult.data;
    next();
  } else {
    res.status(401).json(verifyResult);
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
    res.status(401).json(verifyResult);
  }
};
// create post validation
export const createPostValidationMiddleWare = (
  req: Request<{}, {}, createPostType>,
  res: Response,
  next: NextFunction,
) => {
  //   console.log(req.body);

  const verifyResult = dynamicSchema(createPostSchema, req.body);

  if (verifyResult.success && verifyResult.data) {
    req.body = verifyResult.data;
    next();
  } else {
    res.status(401).json(verifyResult);
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
    res.status(400).json({ message: "field required" });
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
