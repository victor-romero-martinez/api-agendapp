// @ts-check
import "dotenv/config";
import { emailSchema, userUpdatableSchema } from "../schemas/user.schema.mjs";
import { Cipher } from "../utils/cipher.mjs";
import { dateFormatter } from "../utils/dateFormatter.mjs";
import { cat } from "../utils/httpcat.mjs";
import { JwtToken } from "../utils/jwtToken.mjs";
import { logHelper } from "../utils/log-helper.mjs";

const SECRET = process.env.SECRET;
const JWT_SECRET = process.env.JWT;

if (!SECRET || !JWT_SECRET) {
  throw Error("Missing .env");
}

const cipher = new Cipher(SECRET);
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
      const dbr = await this.userModel.findUserByEmail(parse.data);

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
    /** @type {TToken}*/
    // @ts-ignore
    const token = req.decode;

    if (!token.email) {
      return res
        .status(cat["404_NOT_FOUND"])
        .json({ error: "Missing user email" });
    }

    const parse = userUpdatableSchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(parse.error.issues);
    }

    const targetToUpdate = await this.userModel.findUserByEmail(token);

    if (!targetToUpdate) {
      return res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Failed to update user" });
    }

    const { new_password, password, ...updateData } = parse.data;
    /** new data */
    const newData = {
      ...updateData,
      updated_at: dateFormatter(),
    };

    if (parse.data.new_password && parse.data.password) {
      const isAuthorized = cipher.compare(
        parse.data.password,
        targetToUpdate.password
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
          .json({ error: "Failed to update user" });
      }

      try {
        const dataFix = {
          ...newData,
          password: newPassword,
        };

        const dbr = await this.userModel.updateUser(dataFix, targetToUpdate.id);
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
        const dbr = await this.userModel.updateUser(newData, targetToUpdate.id);
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
          .json({ error: "Internal Server Error" });
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

    if (!id || !token.role) {
      return res.status(cat["404_NOT_FOUND"]).json({ error: "Not found" });
    }

    if (token.role.includes("admin")) {
      const newId = { id: +id };

      const dbr = await this.userModel.deleteUser(newId);
      res.json(dbr);
    } else {
      try {
        const findEmail = await this.userModel.findUserByEmail(token);

        if (!findEmail) {
          return res
            .status(cat["500_INTERNAL_SERVER_ERROR"])
            .json({ error: "User not found." });
        }

        const dbr = await this.userModel.deleteUser(findEmail);
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
