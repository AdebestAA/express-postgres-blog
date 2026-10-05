"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = void 0;
const createError = (status, message) => {
    const error = new Error(message);
    //   console.log("new error", error);
    error.status = status;
    //   console.log(error);
    return error;
};
exports.createError = createError;
// createError(404, "something went wrong");
