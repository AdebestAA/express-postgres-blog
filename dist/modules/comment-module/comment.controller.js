"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentController = void 0;
const comment_services_1 = require("./comment.services");
const createCommentController = async (req, res) => {
    try {
        await (0, comment_services_1.addComment)({
            email: req.user?.email,
            post_id: req.body.post_id,
            comment: req.body.comment,
        });
        res.json({ success: true, message: "comment added successfully" });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "something went wrong",
        });
    }
};
exports.createCommentController = createCommentController;
