// @ts-check
import "dotenv/config";
import { emailSchema, userUpdatableSchema } from "../schemas/user.schema.mjs";
import { Cipher } from "../utils/cipher.mjs";
import { cat } from "../utils/httpcat.mjs";
import { logHelper } from "../utils/log-helper.mjs";
import { JwtToken } from "../utils/jwtToken.mjs";

const SECRET = process.env.SECRET;
const JWT_SECRET = process.env.JWT;

if (!SECRET || !JWT_SECRET) {
  throw Error("Missing secret.");
}

const cipher = new Cipher(SECRET);
const jwtToken = new JwtToken(JWT_SECRET);

/** User controller */
export class UserController {
  /**
   * @constructor
   * @param {{ model: TUser }} param
   */
  constructor({ model }) {
    this.model = model;
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  findAll = async (req, res) => {
    try {
      // @ts-ignore
      const dbr = await this.model.findAllUser();
      res.json(dbr);
    } catch (error) {
      logHelper("error ☠", error);
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
      // @ts-ignore
      const dbr = await this.model.findUserByEmail(parse.data);

      if (!dbr) {
        return res
          .status(cat["404_NOT_FOUND"])
          .json({ message: "User does not exists" });
      }

      res.json(dbr);
    } catch (e) {
      logHelper("error ☠");
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
    /**
     *  @type {TToken}*/
    // @ts-ignore
    const token = req.decode;

    if (!token.email) {
      return res
        .status(cat["404_NOT_FOUND"])
        .json({ message: "404 Not Found" });
    }

    const parse = userUpdatableSchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(parse.error.issues);
    }

    // @ts-ignore
    const targetToUpdate = await this.model.findUserByEmail(token);

    if (!targetToUpdate) {
      return res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Failed to update user”" });
    }

    let updateDate = new Date().toISOString();
    let updateDateAdapter = updateDate.replace("T", " ").slice(0, -5);
    /** new data */
    const newData = {
      ...parse.data,
      updated_at: updateDateAdapter,
    };

    if (parse.data.new_password && parse.data.password) {
      const isAuthorized = cipher.compare(
        targetToUpdate.password,
        parse.data.password
      );

      if (!isAuthorized) {
        return res
          .status(cat["404_NOT_FOUND"])
          .json({ error: "Incorrect password" });
      }

      const newPassword = cipher.generate(parse.data.new_password);

      if (!newPassword) {
        return res
          .status(cat["500_INTERNAL_SERVER_ERROR"])
          .json({ error: "Internal Serve Error" });
      }

      try {
        // @ts-ignore
        const dbr = await this.model.updateUser(newData, targetToUpdate.id);
        const token = jwtToken.sign(dbr, "2d");

        res
          .cookie("token", token, {
            maxAge: 172800000,
            httpOnly: true,
            secure: false,
            sameSite: "strict",
          })
          .json(dbr);
      } catch (error) {
        logHelper("error ☠", error);
        res
          .status(cat["500_INTERNAL_SERVER_ERROR"])
          .json({ error: "Failed to update user”" });
      }
    } else {
      try {
        // @ts-ignore
        const dbr = await this.model.updateUser(newData, targetToUpdate.id);
        const token = jwtToken.sign(dbr, "2d");

        res
          .cookie("token", token, {
            maxAge: 172800000,
            httpOnly: true,
            secure: false,
            sameSite: "strict",
          })
          .json(dbr);
      } catch (error) {
        logHelper("error ☠", error);
        res.status(cat["500_INTERNAL_SERVER_ERROR"]).json({ error });
      }
    }
  };

  /** Delete an account [TODO]
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  delete = async (req, res) => {
    /**
     *  @type {TToken} */
    // @ts-ignore
    const token = req.decode;
    const { id } = req.query;

    if (!id) {
      return res.status(cat["400_BAD_REQUEST"]).json({ error: "Bad Request" });
    }

    if (token.role.includes("admin")) {
      // @ts-ignore
      const dbr = await this.model.deleteUser({ id });
      res.json(dbr);
    } else {
      try {
        // @ts-ignore
        const findEmail = await this.model.findUserByEmail(token);

        if (!findEmail) {
          return res
            .status(cat["500_INTERNAL_SERVER_ERROR"])
            .json({ error: "User not found." });
        }

        // @ts-ignore
        const dbr = await this.model.deleteUser(findEmail);
        res.cookie("token", "", { expires: new Date(0) }).json(dbr);
      } catch (error) {
        logHelper("error ☠", error);
        res.status(cat["500_INTERNAL_SERVER_ERROR"]).json(error);
      }
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
 *  */