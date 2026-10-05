import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";

export const asyncHandler = <P extends ParamsDictionary>(
  fn: RequestHandler<P>,
): RequestHandler<P> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
    // Promise.resolve(fn(req, res, next)).catch((error) => {
    //   console.log("something went wrong");
    // });
  };
};
