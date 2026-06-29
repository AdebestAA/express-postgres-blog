"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = void 0;
const init_db_1 = __importDefault(require("../../configs/init-db"));
const addComment = async ({ email, post_id, comment, }) => {
    try {
        // get user form db
        const getUserDetailFromDb = await init_db_1.default.query(`
        SELECT u.id,u.email FROM users u WHERE email = $1 
        `, [email]);
        // if users is not seens
        if (getUserDetailFromDb.rows.length < 0) {
            throw new Error("sorry something went wrong");
        }
        const userData = getUserDetailFromDb.rows[0];
        // add comment to comment table
        await init_db_1.default.query(`
    
    INSERT INTO comments(post_id,comment,user_id)
    VALUES($1,$2,$3)
    `, [post_id, comment, userData.id]);
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
exports.addComment = addComment;
