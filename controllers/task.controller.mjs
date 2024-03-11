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

  /** Get all
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  getAll = async (req, res) => {
    try {
      const dbr = await this.taskModel.findAllTasks();
      res.json(dbr);
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }
  };

  /** Get by author id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  getByAuthor = async (req, res) => {
    const id = +req.params.id;

    if (isNaN(id)) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ error: "Should be a number" });
    }

    try {
      const dbr = await this.taskModel.findTasksNyAuthor(id);
      res.json(dbr);
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }
  };
}

/** @typedef {import('../models/sqlite/tasks.model.mjs').Task} task */
