//@ts-check
// import { User } from "../models/local/user.model.mjs";
import { emailSchema, userSchema } from "../schemas/user.schema.mjs";
import { cat } from "../utils/httpcat.mjs";
import { logHelper } from "../utils/log-helper.mjs";

export class UserController {
  constructor({ model }) {
    this.model = model;
  }

  findAll = async (req, res) => {
    try {
      const dbr = await this.model.findAll();
      res.json(dbr);
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }
  };

  findOneByEmail = async (req, res) => {
    const parse = emailSchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(cat["404_NOT_FOUND"]).json(parse.error.issues);
    }

    try {
      const dbr = await this.model.findOneByEmail(parse.data);

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

  create = async (req, res) => {
    const parse = await userSchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(cat["404_NOT_FOUND"]).json(parse.error.issues);
    }

    // is already
    const isAlreadyExist = await this.model.findOneByEmail(parse.data);
    if (isAlreadyExist) {
      return res
        .status(cat["404_NOT_FOUND"])
        .json({ message: "Email is already exist" });
    }

    try {
      const dbr = await this.model.create(parse.data);
      res.json(dbr);
    } catch (e) {
      logHelper("error ☠", e);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }
  };
}
