import { randomInt } from "node:crypto";
export function generateOtp() {
  let value = "";

  for (let i = 0; i < 6; i++) {
    value += randomInt(0, 10).toString();
  }
  return value;
}
