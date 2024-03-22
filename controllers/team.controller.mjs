// @ts-check
import "dotenv/config";
import { idSchema } from "../schemas/id.schema.mjs";
import { teamEditable, teamSchema } from "../schemas/team.schema.mjs";
import { cat } from "../utils/httpcat.mjs";
import { logHelper } from "../utils/log-helper.mjs";

export class TeamController {
  /** @constructor
   * @param {{ teamModel: import('../models/sqlite/team.model.mjs').Team}} param
   */
  constructor({ teamModel }) {
    this.teamModel = teamModel;
  }

  /** Get team by email query
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getTeam = async (req, res) => {
    /** @type {{ email: string }} */
    // @ts-ignore
    const { email } = req.decode;
    if (!email)
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ error: "Expected a email." });

    try {
      const dbr = await this.teamModel.get(email);
      res.json(dbr);
    } catch (error) {
      logHelper(error, "error ☠");
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error." });
    }
  };

  /** Create Team
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  create = async (req, res) => {
    /** @type {{ email: string }} */
    // @ts-ignore
    const { email } = req.decode;
    if (!email) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ error: "Expected a email." });
    }

    const reqData = teamSchema.safeParse(req.body);
    if (!reqData.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(reqData.error.issues);
    }

    try {
      const dbr = await this.teamModel.create(reqData.data, email);

      if (dbr.message === "Some users were not found or do not exist.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else {
        res.status(cat["201_CREATED"]).json(dbr);
      }
    } catch (error) {
      logHelper(error, "error ☠");
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error." });
    }
  };

  /** Update Team
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  update = async (req, res) => {
    /** @type {{ email: string }} */
    // @ts-ignore
    const { email } = req.decode;
    if (!email) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ error: "Expected a email." });
    }

    const newData = teamEditable.safeParse(req.body);
    if (!newData.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(newData.error.issues);
    }

    try {
      const dbr = await this.teamModel.update(newData.data, email);

      if (dbr?.message === "Team does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else if (dbr?.message === "Unauthorized.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else if (
        dbr?.message === "Some users were not found or do not exist."
      ) {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else {
        res.json(dbr);
      }
    } catch (error) {
      logHelper(error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error." });
    }
  };

  /** Delete a Team
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  delete = async (req, res) => {
    /** @type {{ email: string }} */
    // @ts-ignore
    const { email } = req.decode;
    if (!email) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ error: "Expected a email." });
    }

    const id = req.query?.id;
    if (!id) {
      return res.status(cat["400_BAD_REQUEST"]).json({ error: "Missing id" });
    }
    const newId = idSchema.safeParse({ id: +id });
    if (!newId.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(newId.error.issues);
    }

    try {
      const dbr = await this.teamModel.delete({ id: newId.data.id }, email);

      if (dbr.message === "Team does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else if (dbr.message === "Unauthorized.") {
        res.status(cat["401_UNAUTHORIZED"]).json(dbr);
      } else {
        res.json(dbr);
      }
    } catch (error) {
      logHelper(error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error." });
    }
  };
}
