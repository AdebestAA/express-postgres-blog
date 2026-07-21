"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserData = exports.updateUserDataController = exports.updageProfilePicsController = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const r2_config_1 = require("../../configs/r2-config");
const init_db_1 = __importDefault(require("../../configs/init-db"));
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const updageProfilePicsController = async (req, res) => {
    // validate it
    if (!req.file) {
        return res
            .status(400)
            .json({ success: false, message: "no image uploaded" });
    }
    const allowedImageTypes = ["image/jpeg", "image/png"];
    // check file type
    //
    if (!allowedImageTypes.includes(req?.file?.mimetype)) {
        return res
            .status(400)
            .json({ success: false, message: "only jpeg and png are allowed" });
    }
    if (req.file && req.file?.size > MAX_FILE_SIZE) {
        return res.status(400).json({ success: false, message: "File tooo large" });
    }
    // upload pix to cloud fare
    try {
        const key = `${crypto.randomUUID()}-${req?.file?.originalname}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        });
        await r2_config_1.r2.send(command);
        const url = `${process.env.R2_PUBLIC_URL}/${key}`;
        // no add the key to the db
        const userEmail = req.user?.email;
        console.log(req.user, "user data");
        // so get user profile from db
        const getUserData = await init_db_1.default.query(`SELECT * FROM users u WHERE u.email = $1`, [userEmail]);
        console.log(getUserData.rows[0], "user data from postgress");
        // check if user exist
        if (getUserData.rows.length < 1) {
            return res
                .status(406)
                .json({ success: false, message: "unable to perform operation" });
        }
        const data = getUserData.rows[0];
        // update user avatar column with the returned url
        await init_db_1.default.query(`
        UPDATE users 
        SET avatar = $1
        WHERE email = $2
        `, [url, data.email]);
        return res.status(201).json({ success: true });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unable to perform the operation at this time",
        });
    }
    // res.json({
    //   url,
    // });
};
exports.updageProfilePicsController = updageProfilePicsController;
const updateUserDataController = async (req, res) => {
    console.log(req.body);
    const data = req.body;
    const updates = [];
    const queryValues = [];
    try {
        // update profile
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                queryValues.push(value);
                updates.push(`${key} = $${queryValues.length}`);
            }
        });
        queryValues.push(req.user?.email);
        // console.log("updates", updates);
        // console.log("values", queryValues);
        await init_db_1.default.query(`
      UPDATE users
      SET ${updates.join(" , ")} 
      WHERE email = $${queryValues.length}
       `, [...queryValues]);
        // await pool.query(
        //   `
        //   UPDATE users
        //   SET {first_name = $1 , last_name = $2}
        //   WHERE email = $3
        //    `,
        //   [req.body.first_name, req.body.last_name, req.user?.email],
        // );
        return res.status(201).json({ success: true });
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ success: false, message: "something went wrong" });
    }
};
exports.updateUserDataController = updateUserDataController;
const getUserData = async (req, res) => {
    const userEmail = req.user?.email;
    try {
        const userData = await init_db_1.default.query(`SELECT u.first_name,u.last_name,u.email,u.nickname,u.avatar FROM users u WHERE u.email = $1`, [userEmail]);
        return res.status(200).json({ success: true, data: userData.rows[0] });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "something went wrong",
        });
    }
};
exports.getUserData = getUserData;
