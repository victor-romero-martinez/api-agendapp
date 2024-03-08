//@ts-check
import crypto from "node:crypto";

const ALGORITHM = "aes-256-cbc";

/** Class cipher `string` */
export class Cipher {
  /** @constructor
   * @param {string} secret - Secret string
   */
  constructor(secret) {
    this.secret = secret;
  }

  /** @param {string} str - Str to encrypt */
  generate(str) {
    const hash = crypto.createHash("sha256");
    hash.update(this.secret);

    const key = hash.digest().subarray(0, 32);
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(str, "utf-8", "hex");
    encrypted += cipher.final("hex");

    return encrypted;
  }

  /**
   * @param {string} original - Input User
   * @param {string} ciphertext - Encrypted text db
   */
  compare(original, ciphertext) {
    if (!original || !ciphertext) return;

    const regex = new RegExp(this.generate(original));

    return regex.test(ciphertext);
  }
}
