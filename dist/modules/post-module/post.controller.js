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
    // SELECT * FROM posts JOIN comments ON posts.id = comments.post_id
    try {
        const result = await init_db_1.default.query(`
     SELECT posts.id AS post_id,posts.content AS posts_contents,posts.created_at AS post_created_at, comments.id AS comment_id,comments.comment AS comment_content, comments.created_at AS comment_created_at,users.id AS post_creator_id,users.email AS post_creator FROM posts  JOIN comments ON posts.id = comments.post_id 
      `);
        //  SELECT posts.id,posts.content,posts.user_id , json_agg(
        //       json_build_object(
        //       'id',comments.id,
        //       'comment',comments.comment,
        //       'created_at',comments.created_at
        //       )
        //       ) AS
        //         comments FROM posts
        //        JOIN comments ON posts.id = comments.post_id
        //        GROUP BY posts.id
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
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
