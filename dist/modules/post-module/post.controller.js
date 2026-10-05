"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostByIdController = exports.postLikesController = exports.editPost = exports.getAllPosts = exports.createPostController = void 0;
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
SELECT p.id,p.content,p.created_at,u.nickname,COALESCE(c.comment_count,0) AS comments_count,COALESCE(likes_count,0) AS likes_count FROM posts p 
  LEFT JOIN (SELECT post_id,COUNT(*) AS comment_count 
  FROM comments GROUP BY post_id) c ON p.id = c.post_id 
  LEFT JOIN (SELECT post_id,COUNT(*) AS likes_count 
  FROM likes GROUP BY  post_id) l ON p.id = l.post_id LEFT JOIN users u ON u.id = p.user_id
      `);
        // THIS ALSO WORKED AND RETURN SAME RESULT AS ABOVE BUT I PREFER THE ABOVE ONE BETTER
        // const result = await pool.query(
        //   `
        // SELECT p.user_email,p.content,p.created_at,p.id,COUNT(c.id) AS comment_count , COUNT(DISTINCT(l.id)) AS likes_count
        // FROM posts p LEFT JOIN comments c ON c.post_id = p.id LEFT JOIN likes l ON p.id = l.post_id
        // GROUP BY p.user_email,p.content,p.created_at,p.id
        //   `,
        // );
        console.log(result.rows);
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
const postLikesController = async (req, res) => {
    const postId = req.params.id;
    const userEmail = req.user?.email;
    try {
        const response = await init_db_1.default.query(`SELECT u.id FROM users u WHERE u.email = $1 `, [userEmail]);
        if (response.rows.length < 1) {
            return res
                .status(400)
                .json({ success: false, message: "cant complete operation" });
        }
        const id = response.rows[0].id;
        await init_db_1.default.query(`
      INSERT INTO likes(user_id,post_id)
      VALUES($1,$2)
      `, [id, postId]);
        return res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "something went wrong",
        });
    }
};
exports.postLikesController = postLikesController;
const getPostByIdController = (req, res) => {
    //  const post = await getPostByIdService(req.params.id);
    // res.json({ success: true, data: post });
};
exports.getPostByIdController = getPostByIdController;
