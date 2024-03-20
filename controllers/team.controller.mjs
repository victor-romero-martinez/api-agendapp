// @ts-check
import "dotenv/config";
import { logHelper } from "../utils/log-helper.mjs";
import { cat } from "../utils/httpcat.mjs";
import { teamSchema } from "../schemas/team.schema.mjs";

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
        .json({ error: "Missing email" });

    try {
      const dbr = await this.teamModel.get(email);

      // @ts-ignore
      dbr.map((d) => (d.members = JSON.parse(d.members)));

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
        .json({ error: "Missing email" });
    }

    const reqData = teamSchema.safeParse(req.body);
    if (!reqData.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(reqData.error.issues);
    }

    try {
      const dbr = await this.teamModel.create(reqData.data.members, email);
      res.status(cat["201_CREATED"]).json(dbr);
    } catch (error) {
      logHelper(error, "error ☠");
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
        .json({ error: "Missing email" });
    }

    const { id } = req.query;
    if (!id) {
      return res.status(cat["400_BAD_REQUEST"]).json({ error: "Missing id" });
    }

    try {
      const dbr = await this.teamModel.delete({ id: +id }, email);

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
