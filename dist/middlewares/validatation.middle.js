"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPostValidation = exports.createCommentValidationMiddleWare = exports.createPostValidationMiddleWare = exports.emailVerifyValidationMiddleWare = exports.signinValidationMiddleWare = exports.validationMiddleWare = void 0;
const schemas_1 = require("../validations/schemas");
const constants_1 = require("../constants");
// signup validation middleware
const validationMiddleWare = async (req, res, next) => {
    //   console.log(req.body);
    const verifyResult = (0, constants_1.dynamicSchema)(schemas_1.signUpSchema, req.body);
    if (verifyResult.success && verifyResult.data) {
        req.body = verifyResult.data;
        next();
    }
    else {
        res.status(401).json(verifyResult);
    }
};
exports.validationMiddleWare = validationMiddleWare;
// sign in validation check
const signinValidationMiddleWare = (req, res, next) => {
    console.log(req.body, "data not coming");
    const verifyResult = (0, constants_1.dynamicSchema)(schemas_1.signInSchema, req.body);
    console.log(verifyResult);
    if (verifyResult.success && verifyResult.data) {
        req.body = verifyResult.data;
        next();
    }
    else {
        res.status(401).json(verifyResult);
    }
};
exports.signinValidationMiddleWare = signinValidationMiddleWare;
const emailVerifyValidationMiddleWare = (req, res, next) => {
    //   console.log(req.body);
    const verifyResult = (0, constants_1.dynamicSchema)(schemas_1.emailVerifySchema, req.body);
    if (verifyResult.success && verifyResult.data) {
        req.body = verifyResult.data;
        next();
    }
    else {
        res.status(401).json(verifyResult);
    }
};
exports.emailVerifyValidationMiddleWare = emailVerifyValidationMiddleWare;
// create post validation
const createPostValidationMiddleWare = (req, res, next) => {
    //   console.log(req.body);
    const verifyResult = (0, constants_1.dynamicSchema)(schemas_1.createPostSchema, req.body);
    if (verifyResult.success && verifyResult.data) {
        req.body = verifyResult.data;
        next();
    }
    else {
        res.status(401).json(verifyResult);
    }
};
exports.createPostValidationMiddleWare = createPostValidationMiddleWare;
// create comment validation
const createCommentValidationMiddleWare = (req, res, next) => {
    //   console.log(req.body);
    const verifyResult = (0, constants_1.dynamicSchema)(schemas_1.createCommentSchema, req.body);
    if (verifyResult.success && verifyResult.data) {
        req.body = verifyResult.data;
        next();
    }
    else {
        res.status(400).json(verifyResult);
    }
};
exports.createCommentValidationMiddleWare = createCommentValidationMiddleWare;
const editPostValidation = async (req, res, next) => {
    if (!req?.params?.id || !req?.body?.content) {
        res.status(400).json({ message: "field required" });
    }
    const paramAndbody = {
        post_id: req.params.id,
        content: req.body.content,
    };
    const verifyResult = (0, constants_1.dynamicSchema)(schemas_1.editPostSchema, paramAndbody);
    if (verifyResult.success && verifyResult.data) {
        req.body = { content: verifyResult.data.content };
        req.params = { id: verifyResult.data.post_id };
        next();
    }
    else {
        res.status(400).json(verifyResult);
    }
};
exports.editPostValidation = editPostValidation;
