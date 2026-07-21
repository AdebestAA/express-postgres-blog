"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
console.log("let see");
const algorithm = "aes-256-cbc";
const key = crypto_1.default.randomBytes(32);
const iv = crypto_1.default.randomBytes(16);
const text = "Hello for now";
// enc
const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(text, "utf8", "hex");
encrypted += cipher.final("hex");
console.log(encrypted);
// dec
const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
let decrypted = decipher.update(encrypted, "hex", "utf8");
decrypted += decipher.final("utf8");
console.log("Decrypted:", decrypted);
