"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentsForPostsController = exports.createCommentController = void 0;
const comment_services_1 = require("./comment.services");
const init_db_1 = __importDefault(require("../../configs/init-db"));
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
const getCommentsForPostsController = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ success: false, message: "bad request" });
        }
        const result = await init_db_1.default.query(`
      SELECT * FROM comments WHERE comments.post_id = $1
      `, [req.params.id]);
        return res.json({ success: true, data: result.rows });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "something went wrong",
        });
    }
};
exports.getCommentsForPostsController = getCommentsForPostsController;
