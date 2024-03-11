// @ts-check
import "dotenv/config";
import { auth } from "../schemas/user.schema.mjs";
import { Cipher } from "../utils/cipher.mjs";
import { cat } from "../utils/httpcat.mjs";
import { JwtToken } from "../utils/jwtToken.mjs";
import { logHelper } from "../utils/log-helper.mjs";
import { dateFormatter } from "../utils/dateFormatter.mjs";

const SECRET = process.env.SECRET;
const JWT_SECRET = process.env.JWT;

if (!SECRET || !JWT_SECRET) {
  throw Error("Missing secret.");
}

const cipher = new Cipher(SECRET);
const jwtToken = new JwtToken(JWT_SECRET);

/** Auth controller */
export class AuthController {
  /**
   * @constructor
   * @param {{ userModel: TUser }} param
   */
  constructor({ userModel }) {
    this.userModel = userModel;
  }

  /** Singing up
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  register = async (req, res) => {
    const parse = auth.safeParse(req.body);

    if (!parse.success) {
      return res.status(cat["404_NOT_FOUND"]).json(parse.error.issues);
    }

    // is already
    const isAlreadyExist = await this.userModel.findUserByEmail(parse.data);
    if (isAlreadyExist?.active === 0) {
      const dbr = await this.userModel.updateUser(
        {
          active: true,
          updated_at: dateFormatter(),
        },
        isAlreadyExist.id
      );

      const token = jwtToken.sign(dbr, "2d");

      return res
        .cookie("token", token, {
          maxAge: 172800000,
          httpOnly: true,
          secure: false,
          sameSite: "strict",
        })
        .json(dbr);
    } else if (isAlreadyExist) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ message: "Email is already exist" });
    }

    const newPassword = cipher.generate(parse.data.password);
    const newData = {
      ...parse.data,
      password: newPassword,
    };

    try {
      const session = await this.userModel.createUser(newData);

      const token = jwtToken.sign(session, "2d");

      res
        .cookie("token", token, {
          maxAge: 172800000,
          httpOnly: true,
          secure: false,
          sameSite: "strict",
        })
        .status(cat["201_CREATED"])
        .json(session);
    } catch (e) {
      logHelper("error ☠", e);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }
  };

  /** Signing
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  signing = async (req, res) => {
    const parse = auth.safeParse(req.body);

    if (!parse.success) {
      return res.status(cat["404_NOT_FOUND"]).json(parse.error.issues);
    }

    try {
      const session = await this.userModel.findUserByEmail(parse.data);
      const isSamePassword = cipher.compare(
        parse.data.password,
        session?.password
      );

      if (!session || !isSamePassword) {
        return res
          .status(cat["401_UNAUTHORIZED"])
          .json({ message: "Incorrect password or email" });
      }

      const token = jwtToken.sign(session, "2d");

      res
        .cookie("token", token, {
          maxAge: 172800000,
          httpOnly: true,
          secure: false,
          sameSite: "strict",
        })
        .json(session);
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }
  };

  /** Signout
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  signout = (req, res) => {
    res
      .cookie("token", "", {
        expires: new Date(0),
      })
      .status(cat["200_0K"])
      .json({ message: "Successfully" });
  };
}

/** @typedef {import('../models/sqlite/user.model.mjs').User} TUser */
