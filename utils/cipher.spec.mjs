import "dotenv/config";
import { Cipher } from "./cipher.mjs";
const SECRET = process.env.SECRET;

if (!SECRET) {
  throw Error("Missing secret.");
}

const c = new Cipher(SECRET);

/** @param {string} params */
export function passwordTest(params) {
  return c.generate(params);
}

/**
 * @param {string} a - original
 * @param {string} b - cipher
 */
export function comparePassword(a, b) {
  return c.compare(a, b);
}
