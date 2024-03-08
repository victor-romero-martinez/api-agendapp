import jwt from "jsonwebtoken";
import "dotenv/config";
import { cat } from "../utils/httpcat.mjs";

const JWT_SECRET = process.env.JWT;

if (!JWT_SECRET) {
  throw Error("Missing .env JWT");
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export default function jwtMiddleware(req, res, next) {
  const { token } = req.cookies;

  jwt.verify(token, JWT_SECRET, (error, decode) => {
    if (error) {
      return res
        .status(cat["401_UNAUTHORIZED"])
        .json({ message: "Unauthorize" });
    }

    req.decode = decode;
    next();
  });
}
