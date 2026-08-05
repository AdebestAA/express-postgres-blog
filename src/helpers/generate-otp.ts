export function generateOtp() {
  let value = "";

  console.log(Math.floor(Math.random() * 10));

  for (let i = 0; i < 6; i++) {
    value += Math.floor(Math.random() * 9).toString();
  }
  return Number(value);
}
