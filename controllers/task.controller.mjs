//@ts-check
import { taskSchema } from "../schemas/task.schema.mjs";
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

  /** Get task by author id
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
      const dbr = await this.taskModel.findTasksByAuthorId(id);
      res.json(dbr);
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }
  };

  /** Create a new task
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  createTask = async (req, res) => {
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

    const idAuthor = await this.taskModel.getIdAuthor(email);

    if (!idAuthor) {
      return res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }

    try {
      const newData = { ...reqData.data, author_id: idAuthor.id };
      const dbr = await this.taskModel.createNewTask(newData);
      res.json(dbr);
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Error to create task" });
    }
  };
}

/** @typedef {import('../models/sqlite/tasks.model.mjs').Task} task */
