// @ts-check
import jwt from "jsonwebtoken";

/** JWT token class */
export class JwtToken {
  /** @constructor
   * @param {string} secret
   */
  constructor(secret) {
    this.secret = secret;
  }

  /** Sign Token
   * @param {{
   * email?: string,
   * user_name?: string,
   * url_img?: string,
   * role?: string
   * }} owner - Payload
   * @param {string|number} expires - Expires token `"2d"` or `172800000`
   */
  sign(owner, expires) {
    return jwt.sign(
      {
        email: owner.email,
        username: owner.user_name,
        url: owner.url_img,
        role: owner?.role,
      },
      this.secret,
      { expiresIn: expires }
    );
  }

  /** Verify token
   * @param {string} token
   */
  verify(token) {
    return jwt.verify(token, this.secret);
  }
}
