import { NextFunction, Request, Response } from "express";
import { createPostType } from "../validations/schemas";
import jwt from "jsonwebtoken";
import { accessTokenSecret } from "../constants";

type JwtPayloadType = { email: string; iat: number; exp: number };

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authToken = req.headers.authorization;
  if (!authToken || !authToken.startsWith("Bearer ")) {
    res.status(400).json({ success: false, message: "No token" });
    return;
  }
  try {
    const getToken = authToken.split(" ")[1];

    const verifyToken = jwt.verify(
      getToken,
      accessTokenSecret,
    ) as JwtPayloadType;

    req.user = { email: verifyToken.email };
    // res.json({ success: true, message: "verified" });

    next();
  } catch (error) {
    console.log(error);

    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
