//@ts-check
import { taskEditable, taskSchema } from "../schemas/task.schema.mjs";
import { dateFormatter } from "../utils/dateFormatter.mjs";
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
        const dbr = await this.taskModel.findAllTasks();
        res.json(dbr);
      } catch (error) {
        logHelper("error ☠", error);
        res
          .status(cat["500_INTERNAL_SERVER_ERROR"])
          .json({ error: "Internal Server Error" });
      }
    } else {
      // convert to number
      const id = +req.query.author_id;
      // verify is NaN
      if (isNaN(id)) {
        return res
          .status(cat["400_BAD_REQUEST"])
          .json({ error: "id Must be a number" });
      }
      try {
        const dbr = await this.taskModel.findTasksByAuthorId(id);
        res.json(dbr);
      } catch (error) {
        logHelper("error ☠", error);
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
  getTaskById = async (req, res) => {
    const id = +req.params.id;

    if (isNaN(id)) {
      return res
        .status(cat["400_BAD_REQUEST"])
        .json({ error: "Should be a number" });
    }

    try {
      const dbr = await this.taskModel.getTaskById(id);

      if (!dbr) {
        return res
          .status(cat["404_NOT_FOUND"])
          .json({ message: "Task does not exist." });
      }

      res.json(dbr);
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server Error" });
    }
  };

  /**  */

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

    const idAuthor = await this.taskModel.getAuthorID(email);
    if (!idAuthor) {
      return res
        .status(cat["404_NOT_FOUND"])
        .json({ error: "User does not exists" });
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

  /** Update a task
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * */
  updateTask = async (req, res) => {
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
      // current agent
      const authorID = await this.taskModel.getAuthorID(email);
      // get original task from DB and extract author_id
      const task = await this.taskModel.getTaskById(reqData.data.id);
      // compare if current agent is owner of task
      if (authorID.id !== task.author_id) {
        return res
          .status(cat["401_UNAUTHORIZED"])
          .json({ message: "Unauthorize" });
      }

      const updated_at = dateFormatter();
      const { id, ...data } = reqData.data;
      const newData = {
        updated_at,
        ...data,
      };
      const dbr = await this.taskModel.updateTask(newData, id);
      res.json(dbr);
    } catch (error) {
      logHelper("error ☠", error);
      res
        .status(cat["500_INTERNAL_SERVER_ERROR"])
        .json({ error: "Internal Server error" });
    }
  };
}

/** @typedef {import('../models/sqlite/tasks.model.mjs').Task} task */
