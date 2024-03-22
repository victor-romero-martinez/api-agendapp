// @ts-check
import "dotenv/config";
import { emailSchema, userUpdatableSchema } from "../schemas/user.schema.mjs";
import { isEmpty } from "../utils/check-isEmpty.mjs";
import { cat } from "../utils/httpcat.mjs";
import { JwtToken } from "../utils/jwtToken.mjs";
import { logHelper } from "../utils/log-helper.mjs";

const SECRET = process.env.SECRET;
const JWT_SECRET = process.env.JWT;

if (!SECRET || !JWT_SECRET) {
  throw Error("Missing .env");
}

const jwtToken = new JwtToken(JWT_SECRET);

/** User controller */
export class UserController {
  /**
   * @constructor
   * @param {{ userModel: TUser }} param
   */
  constructor({ userModel }) {
    this.userModel = userModel;
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  findAll = async (req, res) => {
    try {
      const dbr = await this.userModel.findAllUser();
      res.json(dbr);
    } catch (error) {
      logHelper(error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }
  };

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  getByEmail = async (req, res) => {
    const parse = emailSchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(cat["404_NOT_FOUND"]).json(parse.error.issues);
    }

    try {
      const dbr = await this.userModel.findUserByEmail(parse.data);

      if (!dbr) {
        return res
          .status(cat["404_NOT_FOUND"])
          .json({ message: "User does not exists" });
      }

      res.json(dbr);
    } catch (e) {
      logHelper(e);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }
  };

  /** Update a user
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  update = async (req, res) => {
    /** @type {TToken}*/
    // @ts-ignore
    const token = req.decode;

    if (!token.email) {
      return res
        .status(cat["404_NOT_FOUND"])
        .json({ error: "Missing user email" });
    }

    const empty = isEmpty(req.body);
    if (empty) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ error: "Must be not empty body." });
    }

    const parse = userUpdatableSchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(parse.error.issues);
    }
    try {
      const dbr = await this.userModel.updateUser(parse.data, token.email);
      if (dbr.message === "Failed to update user.") {
        res.status(cat["500_INTERNAL_SERVER_ERROR"]).json(dbr);
      } else if (dbr.message === "Incorrect password.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else {
        const token = jwtToken.sign(dbr, "2d");
        res
          .cookie("token", token, {
            maxAge: 172800000,
            httpOnly: true,
            secure: false,
            sameSite: "strict",
          })
          .json(dbr);
      }
    } catch (error) {
      logHelper(error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error." });
    }
  };

  /** Delete an account [TODO]
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  delete = async (req, res) => {
    const id = req.query?.id;
    /** @type {{ email: string}} */
    // @ts-ignore
    const { email } = req.decode;

    if (!id) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ message: "Missing user id" });
    } else if (!email) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ message: "Missing user email" });
    }

    try {
      const dbr = await this.userModel.deleteUser(+id, email);

      if (dbr.message === "User does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else if (dbr.message === "Unauthorize.") {
        res.status(cat["401_UNAUTHORIZED"]).json(dbr);
      } else {
        res.cookie("token", "", { expires: new Date(0) }).json(dbr);
      }
    } catch (error) {
      logHelper(error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error." });
    }
  };

  /** Verify email active db
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
      return res
        .status(cat["404_NOT_FOUND"])
        .send(
          `<body style="margin: 0;font-family: &quot;system-ui&quot;, sans-serif;"><main style="display: flex;height: 100vh;justify-content: center;align-items: center;"><h1>404 Not Found :(</h1></main></body>`
        );
    }

    try {
      /** @type {{ email: string }} */
      // @ts-ignore
      const decode = jwtToken.verify(token);
      if (!decode) {
        return res
          .status(cat["404_NOT_FOUND"])
          .send(
            `<body style="margin: 0;font-family: &quot;system-ui&quot;, sans-serif;"><main style="display: flex;height: 100vh;justify-content: center;align-items: center;"><h1>404 Not Found :(</h1></main></body>`
          );
      }

      const dbr = await this.userModel.updateUser(
        { verified: true, token_email: null },
        decode.email
      );
      res.send(`<body style="margin: 0;font-family: &quot;system-ui&quot;, sans-serif;"><main style="display: flex;height: 100vh;justify-content: center;align-items: center;flex-direction: column;"><h1>Congratulations 🎉</h1>
      <p>Your account ${dbr.email} is successfully verify.</p></main></body>`);
    } catch (error) {
      logHelper(error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error." });
    }
  };
}

/** @typedef {import('../models/sqlite/user.model.mjs').User} TUser */
/**
 *  @typedef {{
 * email: string,
 * username: string|null,
 * role: 'admin'|'user'
 * }} TToken
 **/
