import crypto from "crypto";

console.log("let see");

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const text = "Hello for now";
// enc
const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(text, "utf8", "hex");
encrypted += cipher.final("hex");
console.log(encrypted);

// dec
const decipher = crypto.createDecipheriv(algorithm, key, iv);
let decrypted = decipher.update(encrypted, "hex", "utf8");
decrypted += decipher.final("utf8");

console.log("Decrypted:", decrypted);
