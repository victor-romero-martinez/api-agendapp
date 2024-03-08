// @ts-check
import { JwtToken } from "./jwtToken.mjs";
import "dotenv/config";

const JWT_SECRET = process.env.JWT;

if (!JWT_SECRET) {
  throw new Error("JWT secret is missing");
}

const jwt = new JwtToken(JWT_SECRET);

/**
 * @param {{
 * id?: number,
 * email?: string,
 * user_name?: string,
 * url_img?: string,
 * role?: string
 * }} o - Objet element
 * @param {string|number} e - Expires params
 * @returns
 */
export function generateTokenTest(o, e) {
  const res = jwt.sign(o, e);
  return res;
}

/**
 * @param {string} params
 * */
export function verifyTokenTest(params) {
  const res = jwt.verify(params);
  return res;
}

/** Examples */

// console.log(generateTokenTest({ user_name: "John Doe" }, "1d"));

// console.log(
//   verifyTokenTest(
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzA5NzU4MTIwLCJleHAiOjE3MDk4NDQ1MjB9.OJdgZv_CxdUQJvlm2vg_FIWuf309GvmzXNLWUNQrgU8"
//   )
// );
