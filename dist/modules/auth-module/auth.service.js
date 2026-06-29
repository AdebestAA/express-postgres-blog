"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshToken = exports.createAccessToken = exports.signInCheck = exports.checkOtpValidity = exports.sendVerificationToken = exports.addUserOtpToOtpTable = exports.addUserToDb = void 0;
const constants_1 = require("../../constants");
const init_db_1 = __importDefault(require("../../configs/init-db"));
const bcrypt_1 = __importStar(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const redis_config_1 = require("../../configs/redis-config");
// ADD USER TO DB
const addUserToDb = async (data) => {
    const salt = await (0, bcrypt_1.genSalt)(10);
    const hashedPassword = await bcrypt_1.default.hash(data.password, salt);
    try {
        // check if user exists
        const checkIfUserExists = await init_db_1.default.query(`
      SELECT * FROM users WHERE email = $1 
      `, [data.email]);
        if (checkIfUserExists.rows.length > 0) {
            // check is user is verified
            if (checkIfUserExists.rows[0].is_verified === 1) {
                throw new Error("Account is verifed already");
            }
            // if user is not verified now update the table with the new details sent
            await init_db_1.default.query(`UPDATE users
        SET nickname = $1,
 password = $2
        WHERE email = $3
        `, [data.nickname, hashedPassword, data.email]);
        }
        else {
            await init_db_1.default.query(`
          INSERT INTO users (email,password,nickname)
          VALUES($1,$2,$3)
          RETURNING *
          `, [data.email, hashedPassword, data.nickname]);
        }
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : "something went wrong";
        throw new Error(errorMsg);
    }
};
exports.addUserToDb = addUserToDb;
// add user otp to otp table
const addUserOtpToOtpTable = async (email, token) => {
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
    // this updates the token even if the user email already exist in teh otp table
    try {
        await init_db_1.default.query(`
        INSERT INTO otp (email,token,expiry_time)
        VALUES($1,$2,$3)
        ON CONFLICT (email)
        DO UPDATE SET
        token = EXCLUDED.token,
        expiry_time = EXCLUDED.expiry_time
        RETURNING *
        `, [email, token, expiryTime]);
    }
    catch (error) {
        const errorMsg = error instanceof Error
            ? error.message
            : "something went wrong, unable save verification details";
        throw new Error(errorMsg);
    }
};
exports.addUserOtpToOtpTable = addUserOtpToOtpTable;
const sendVerificationToken = async (email, otp, type = "signup_verify") => {
    try {
        const isSignupVerify = type === "signup_verify";
        const subject = isSignupVerify
            ? "Very Your Email Before Signup"
            : "Reset Password";
        const html = `
        <h2>${subject}</h2>
        <p>Below is your opt (expires in 10min)</p>
        <h1>
         ${otp}
        </h1>
      `;
        console.log("KEY EXISTS:", !!constants_1.brevo_api_key);
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": constants_1.brevo_api_key,
                // "api-key": process.env.BREVO_API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sender: {
                    email: "aadebesta@gmail.com",
                    name: "My Project",
                },
                to: [{ email }],
                subject,
                htmlContent: html,
            }),
        });
        console.log("sent successfully", await response.json());
    }
    catch (error) {
        console.log("EMAIL ERROR:", error);
        throw new Error("Failed to send otp");
    }
};
exports.sendVerificationToken = sendVerificationToken;
const checkOtpValidity = async ({ email, otp, }) => {
    try {
        // check if email exist in the db
        const result = await init_db_1.default.query(`
      SELECT u.email,u.is_verified FROM users u WHERE email = $1
      `, [email]);
        // if email does not exsit in the db
        if (result.rows.length < 1) {
            throw new Error("user does not exsit");
        }
        // now check if user is verified
        if (result.rows[0].is_verified === 1) {
            throw new Error("accout already verified");
        }
        // get check if user otp exist
        const otpCheckResult = await init_db_1.default.query(`
      SELECT o.email,o.token,o.expiry_time FROM otp o  WHERE email = $1 
      `, [email]);
        // if user doesn't exist in the opt table
        if (otpCheckResult.rows.length < 1) {
            throw new Error("sorry otp does not exist");
        }
        // check if otp hasn't expired
        const now = new Date(Date.now());
        const expiryTime = otpCheckResult.rows[0].expiry_time;
        if (now > expiryTime) {
            throw new Error("code is expired already");
        }
        // compare code now
        if (otp !== otpCheckResult.rows[0].token) {
            throw new Error("invalid otp code");
        }
        // verify user
        await init_db_1.default.query(`
      UPDATE users 
      SET is_verified = $1
      WHERE email = $2
      `, [1, email]);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : " something went wrong";
        throw new Error(errorMsg);
    }
};
exports.checkOtpValidity = checkOtpValidity;
const signInCheck = async ({ email, password, }) => {
    try {
        // check if email exist in the db
        const result = await init_db_1.default.query(`
      SELECT u.email,u.password,u.is_verified FROM users u WHERE email = $1
      `, [email]);
        // console.log();
        // if email does not exsit in the db
        if (result.rows.length < 1) {
            throw new Error("user does not exsit");
        }
        // chekc if password is correct
        const comparePassword = await bcrypt_1.default.compare(password, result.rows[0].password);
        if (!comparePassword) {
            throw new Error("invalid credentials");
        }
        // now check if user isn't verified
        if (result.rows[0].is_verified !== 1) {
            throw new Error("accout is not verified");
        }
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : " something went wrong";
        throw new Error(errorMsg);
    }
};
exports.signInCheck = signInCheck;
// create access token
const createAccessToken = async (email) => {
    const accessToken = jsonwebtoken_1.default.sign({ email: email }, constants_1.accessTokenSecret, {
        expiresIn: "15m",
    });
    return accessToken;
};
exports.createAccessToken = createAccessToken;
// create refresh token ( the refresh token stores the userEmail and userSession)
const createRefreshToken = async (email) => {
    const sessionId = (0, uuid_1.v4)();
    try {
        // add sessionId for user multii device signin => (i.e when user signin in on PC and on thier mobile phone => when they sign out from one the devices it doesn't affect the other can both devices have different sesssions generated on login)
        await redis_config_1.redisClient.set(`refresh:${sessionId}`, JSON.stringify({
            email: email,
            create_at: new Date(Date.now()),
        }), "EX", 60 * 60 * 24 * 7);
        ("success");
    }
    catch (error) {
        console.log(error);
    }
    const refreshToken = jsonwebtoken_1.default.sign({ userEmail: email, userSession: sessionId }, constants_1.refreshTokenSecret, {
        expiresIn: "7d",
    });
    return refreshToken;
};
exports.createRefreshToken = createRefreshToken;
