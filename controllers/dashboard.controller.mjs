// @ts-check
import {
  DashboardSchema,
  DashboardUpdateSchema,
} from "../schemas/dashboard.schema.mjs";
import { cat } from "../utils/httpcat.mjs";
import { logHelper } from "../utils/log-helper.mjs";

/** Dashboard controller */
export class DashboardController {
  /**
   * @constructor
   * @param {{ dashboardModel: import('../models/sqlite/dashboard.model.mjs').Dashboard }} param
   */
  constructor({ dashboardModel }) {
    this.dashboardModel = dashboardModel;
  }

  /** Find all dashboard by email
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  groupByEmail = async (req, res) => {
    /** @type {{ email: string }} */
    // @ts-ignore
    const { email } = req.decode;
    if (!email) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ error: "Missing email." });
    }

    try {
      const dbr = await this.dashboardModel.groupByEmail(email);
      if (dbr.message === "User does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else {
        res.json(dbr);
      }
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error." });
    }
  };

  /** Create a new dashboard
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
        .json({ error: "Missing email." });
    }

    const reqData = DashboardSchema.safeParse(req.body);
    if (!reqData.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(reqData.error.issues);
    }

    try {
      const dbr = await this.dashboardModel.create(reqData.data, email);
      if (dbr.message === "User does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else {
        res.status(cat["201_CREATED"]).json(dbr);
      }
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Error creating dashboard." });
    }
  };

  /** Update a dashboard
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
        .json({ error: "Missing email." });
    }

    const reqData = DashboardUpdateSchema.safeParse(req.body);
    if (!reqData.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(reqData.error.issues);
    }

    try {
      const dbr = await this.dashboardModel.update(reqData.data, email);
      if (dbr.message === "User does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else {
        res.json(dbr);
      }
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Error updating dashboard." });
    }
  };

  /** Delete a dashboard
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
        .json({ error: "Missing email." });
    }

    const idQuery = req.query?.id;
    if (!idQuery) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ error: "Missing id query." });
    }

    try {
      const id = +idQuery;
      const dbr = await this.dashboardModel.delete({ email, id });
      if (dbr.message === "User does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else if (dbr.message === "Dashboard does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else {
        res.json(dbr);
      }
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error." });
    }
  };
}
