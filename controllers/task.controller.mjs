//@ts-check
import { idSchema } from "../schemas/id.schema.mjs";
import { taskEditable, taskSchema } from "../schemas/task.schema.mjs";
import { cat } from "../utils/httpcat.mjs";
import { logHelper } from "../utils/log-helper.mjs";

/** Task controller */
export class TaskController {
  /**
   * @constructor
   * @param {{ taskModel: task}} param
   */
  constructor({ taskModel }) {
    this.taskModel = taskModel;
  }

  /** Get all task
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  getAll = async (req, res) => {
    if (!req.query?.author_id) {
      try {
        const dbr = await this.taskModel.findAll();
        res.json(dbr);
      } catch (error) {
        logHelper(error);
        res
          .status(cat["500_INTERNAL_SERVER_ERROR"])
          .json({ error: "Internal Server Error" });
      }
    } else {
      // convert to number
      const id = idSchema.safeParse({ id: +req.query.author_id });
      // verify is NaN
      if (!id.success) {
        return res.status(cat["400_BAD_REQUEST"]).json(id.error.issues);
      }
      try {
        const dbr = await this.taskModel.findByAuthorId(id.data.id);
        res.json(dbr);
      } catch (error) {
        logHelper(error);
        res
          .status(cat["500_INTERNAL_SERVER_ERROR"])
          .json({ error: "Internal Server error." });
      }
    }
  };

  /** Get task by id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  getById = async (req, res) => {
    const id = idSchema.safeParse({ id: +req.params.id });
    if (!id.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(id.error.issues);
    }

    try {
      const dbr = await this.taskModel.getById(id.data.id);

      if (!dbr) {
        return res
          .status(cat["404_NOT_FOUND"])
          .json({ message: "Task does not exist." });
      }

      res.json(dbr);
    } catch (error) {
      logHelper(error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }
  };

  /** Create a new task
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  create = async (req, res) => {
    const reqData = taskSchema.safeParse(req.body);

    /** @type {{email: string}} */
    // @ts-ignore
    const { email } = req.decode;

    if (!reqData.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(reqData.error.issues);
    } else if (!email) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ error: "Missing email" });
    }

    try {
      const dbr = await this.taskModel.create(reqData.data, email);
      if (dbr.message === "User does not exist.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else if (dbr.message === "Dashboard does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else if (dbr.message === "Forbidden.") {
        res.status(cat["403_FORBIDDEN"]).json(dbr);
      } else {
        res.status(cat["201_CREATED"]).json(dbr);
      }
    } catch (error) {
      logHelper(error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Error to create task" });
    }
  };

  /** Update a task
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  update = async (req, res) => {
    const reqData = taskEditable.safeParse(req.body);
    /** @type {{ email: string }} */
    // @ts-ignore
    const { email } = req.decode;

    if (!reqData.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(reqData.error.issues);
    } else if (!email) {
      return res.status(cat["404_NOT_FOUND"]).json({ error: "Missing Email" });
    }

    try {
      const dbr = await this.taskModel.update(reqData.data, email);

      if (dbr.message === "Task does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else if (dbr.message === "User does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else if (dbr.message === "Dashboard does not exists.") {
        res.status(cat["404_NOT_FOUND"]).json(dbr);
      } else if (dbr.message === "Forbidden.") {
        res.status(cat["403_FORBIDDEN"]).json(dbr);
      } else {
        res.json(dbr);
      }
    } catch (error) {
      logHelper(error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server error" });
    }
  };

  /** Delete a task by id from query-params
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  delete = async (req, res) => {
    const { id } = req.query;
    /** @type {{ email: string }} */
    // @ts-ignore
    const { email } = req.decode;

    if (!id) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ error: "Must provide an id." });
    } else if (!email) {
      return res
        .status(cat["404_NOT_FOUND"])
        .json({ error: "Missing email token." });
    }
    const newId = idSchema.safeParse({ id: +id });
    if (!newId.success) {
      return res.status(cat["400_BAD_REQUEST"]).json(newId.error.issues);
    }

    try {
      const dbr = await this.taskModel.delete(newId.data.id, email);

      if (dbr.message === "User does not exist.") {
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
        .json({ error: "Internal Sever Error." });
    }
  };
}

/** @typedef {import('../models/sqlite/tasks.model.mjs').Task} task */
