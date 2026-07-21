"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPost = exports.getAllPosts = exports.createPostController = void 0;
const post_services_1 = require("./post.services");
const init_db_1 = __importDefault(require("../../configs/init-db"));
const createPostController = async (req, res) => {
    try {
        await (0, post_services_1.addPostToDb)({
            content: req.body.content,
            email: req.user?.email,
        });
        res.json({ success: true, message: "post added successfully" });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "something went wrong",
        });
    }
};
exports.createPostController = createPostController;
const getAllPosts = async (req, res) => {
    const queryParams = req.query;
    try {
        console.log("query params", queryParams);
        const result = await init_db_1.default.query(`
    SELECT p.user_email,p.content,p.created_at,p.id,COUNT(c.id) AS comment_count FROM posts p LEFT JOIN comments c ON c.post_id = p.id GROUP BY p.user_email,p.content,p.created_at,p.id 
      `);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.log("failed");
        console.log(error instanceof Error ? error.message : "something went wrong");
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "something went wrong",
        });
    }
};
exports.getAllPosts = getAllPosts;
const editPost = async (req, res) => {
    const data = {
        post_id: req.params.id,
        content: req.body.content,
        email: req.user?.email,
    };
    try {
        await (0, post_services_1.editPostService)(data);
        res.json({ success: true, message: "post edited" });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "something went wrong",
        });
    }
};
exports.editPost = editPost;
