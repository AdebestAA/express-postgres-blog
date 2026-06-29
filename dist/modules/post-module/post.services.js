"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPostService = exports.addPostToDb = void 0;
const init_db_1 = __importDefault(require("../../configs/init-db"));
const addPostToDb = async ({ content, email, }) => {
    try {
        const getUserDetailFromDb = await init_db_1.default.query(`
        SELECT u.id,u.email FROM users u WHERE email = $1 
        `, [email]);
        // if users is not seens
        if (getUserDetailFromDb.rows.length < 0) {
            throw new Error("sorry something went wrong");
        }
        const userData = getUserDetailFromDb.rows[0];
        // now add user content
        await init_db_1.default.query(`
            INSERT INTO posts(user_id,content)
            VALUES($1,$2)
            `, [userData.id, content]);
    }
    catch (error) {
        // console.log(error);
        if (typeof error === "object" && error !== null) {
            const err = error;
            if (err.code === "23503") {
                throw new Error("user doesn't exist");
            }
        }
        const errorMsg = error instanceof Error ? error.message : "something went wrong";
        throw new Error(errorMsg);
    }
};
exports.addPostToDb = addPostToDb;
const editPostService = async ({ post_id, content, email, }) => {
    try {
        const getUserId = await init_db_1.default.query(`
      SELECT users.id  FROM users WHERE email = $1
      `, [email]);
        if (getUserId.rows.length < 1) {
            throw new Error("user doesn't exsits");
        }
        const userId = getUserId.rows[0].id;
        console.log(getUserId.rows[0]);
        const result = await init_db_1.default.query(`
      UPDATE posts
      SET content = $1
      WHERE id = $2 AND user_id = $3
     `, [content, post_id, userId]);
        if (result.rowCount === 0) {
            throw new Error("post not found or unauthorized");
        }
        console.log(result);
        console.log("success");
    }
    catch (error) {
        console.log(error);
        if (typeof error === "object" && error !== null) {
            const err = error;
            if (err.code === "23503") {
                throw new Error("user doesn't exist");
            }
            if (err.code === "22P02") {
                throw new Error("Invalid Id Format");
            }
        }
        // const errorMsg =
        //   error instanceof Error ? error.message : "something went wrong";
        // console.log("errorMsg", errorMsg);
        throw new Error("something went wrong");
    }
};
exports.editPostService = editPostService;
