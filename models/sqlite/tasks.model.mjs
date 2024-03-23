//@ts-check
import { randomColor } from "../../utils/random-color.mjs";
import { placeholderQuery } from "../../utils/slq-placeholder.mjs";
import { db } from "./config/database.local.mjs";
import { DASHBOARD_TABLE } from "./dashboard.model.mjs";
import { USER_TABLE } from "./user.model.mjs";

/** Name of table */
const TASK_TABLE = "task";

/** Tasks model SQLite */
export class Task {
  /** Get all tasks
   * @returns {Promise<Array<TTask&TResponse>>}
   */
  findAll() {
    return new Promise((res, rej) => {
      const sql = `SELECT * FROM ${TASK_TABLE}`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          rej(err);
        } else {
          res(rows);
        }
      });
    });
  }

  /** Get all tasks by author_id
   * @param {number} id
   * @returns {Promise<Array<TTask&TResponse>>}
   */
  findByAuthorId(id) {
    try {
      return new Promise((res, rej) => {
        const sql = `SELECT * FROM ${TASK_TABLE} WHERE dashboard_id = (SELECT id FROM ${DASHBOARD_TABLE} WHERE owner_id = ?)`;
        db.all(sql, [id], (err, rows) => {
          if (err) {
            rej(err);
          } else {
            res(rows);
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  /** Get a task by id
   * @param {number} id
   * @returns {Promise<TTask&TResponse>}
   */
  getById(id) {
    return new Promise((res, rej) => {
      const sql = `SELECT * FROM ${TASK_TABLE} WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          rej(err);
        } else {
          res(row);
        }
      });
    });
  }

  /** Create a task
   * @param {TTask} data
   * @param {string} email
   * @returns {Promise<TTask&TResponse>}
   */
  async create(data, email) {
    try {
      const author = await this.#getAuthorID(email);
      if (!author) return { message: "User does not exist." };

      // @ts-ignore
      const owner = await this.#findDashboardById(data.dashboard_id);
      if (!owner) return { message: "Dashboard does not exists." };

      if (author.id !== owner.owner_id) {
        return { message: "Forbidden." };
      }

      // check is exist user to assign
      const isValidUser = await this.#findUserExist(data);
      if (isValidUser.result == false) {
        return { message: "User not valid." };
      }

      const newData = { ...data, color: randomColor() };
      const placeholder = placeholderQuery(newData);

      const sql = `INSERT INTO ${TASK_TABLE} (${
        placeholder[0]
      }) VALUES(${placeholder[1].map(() => "?").join(", ")})`;

      return new Promise((res, rej) => {
        db.run(sql, [...placeholder[1]], function (err) {
          if (err) {
            rej(err);
          } else {
            const lastId = this.lastID;
            const sql2 = `SELECT * FROM ${TASK_TABLE} WHERE id = ?`;
            db.get(sql2, [lastId], (err, row) => {
              if (err) {
                rej(err);
              } else {
                res(row);
              }
            });
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  /** Update a task [TODO] feature to change of dashboard
   * @param {TTask} data
   * @param {string} email
   * @returns {Promise<TTask&TResponse>}
   */
  async update(data, email) {
    try {
      /** task */
      // @ts-ignore
      const isExist = await this.#checkTask(data.id);

      if (!isExist) return { message: "Task does not exists." };

      const author = await this.#getAuthorID(email);
      if (!author) return { message: "User does not exists." };

      // @ts-ignore
      const dashboard = await this.#findDashboardById(data.dashboard_id);
      if (!dashboard) return { message: "Dashboard does not exists." };

      if (
        author.id !== dashboard.owner_id ||
        isExist.dashboard_id !== dashboard.id
      ) {
        return { message: "Forbidden." };
      }

      // check is exist user to assign
      const isValidUser = await this.#findUserExist(data);
      if (isValidUser.result == false) {
        return { message: "User not valid." };
      }

      // split id and data
      const { id, ...newData } = data;

      return new Promise((res, rej) => {
        const placeholder = placeholderQuery(newData, "UPDATE");
        const sql = `UPDATE ${TASK_TABLE} SET ${placeholder[0]}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

        db.run(sql, [...placeholder[1], id], function (err) {
          if (err) {
            rej(err);
          } else {
            const slq2 = `SELECT * FROM ${TASK_TABLE} WHERE id = ?`;
            db.get(slq2, [id], (err, row) => {
              if (err) {
                rej(err);
              } else {
                res(row);
              }
            });
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  // * @returns {Promise<TTask&TResponse>}
  /** Delete a task
   * @param {number} taskId - Id of tasks
   * @param {string} email - Id of author
   */
  async delete(taskId, email) {
    try {
      const isExist = await this.#checkTask(taskId);
      if (!isExist) return { message: "Task does not exists." };

      const authorId = await this.#getAuthorID(email);
      if (!authorId) return { message: "User does not exists." };

      return new Promise((res, rej) => {
        const sql = `DELETE FROM ${TASK_TABLE} WHERE id = ? AND dashboard_id = (SELECT id FROM ${DASHBOARD_TABLE} WHERE owner_id = ?);`;
        db.run(sql, [taskId, authorId.id], (err) => {
          if (err) {
            rej(err);
          } else {
            res({ message: `Deleted successfully tasks ${taskId}.` });
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  /** Get id of author by email
   * @param {string} email - Author email
   * @returns {Promise<{id: number}>}
   */
  #getAuthorID(email) {
    return new Promise((res, rej) => {
      const sql = `SELECT id FROM ${USER_TABLE} WHERE email = ?`;
      db.get(sql, [email], (err, row) => {
        if (err) {
          rej(err);
        } else {
          res(row);
        }
      });
    });
  }

  /** Check task is exist
   * @param {number} idTask
   * @returns {Promise<TTask&TResponse>}
   */
  #checkTask(idTask) {
    return new Promise((res, rej) => {
      const checkSql = `SELECT * FROM task WHERE id = ?;`;

      db.get(checkSql, [idTask], (err, row) => {
        if (err) {
          rej(err);
        } else {
          res(row);
        }
      });
    });
  }

  /** Find owner_id and id of dashboard
   * @param {number} id
   * @returns {Promise<{id: number, owner_id: number}>}
   */
  #findDashboardById(id) {
    return new Promise((res, rej) => {
      const sql = `SELECT owner_id, id FROM ${DASHBOARD_TABLE} WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          rej(err);
        } else {
          res(row);
        }
      });
    });
  }

  /** Find User exist by id
   * @param {TTask} data
   * @returns {Promise<{ result: boolean }>}
   */
  #findUserExist(data) {
    return new Promise((res, rej) => {
      const sql = `SELECT EXISTS (SELECT * FROM user WHERE id = ?) AS result;`;
      db.get(sql, [data.assigned_to], (err, row) => {
        if (err) {
          rej(err);
        } else {
          res(row);
        }
      });
    });
  }
}

/** Type input
 * @typedef {{
 *  id?: number,
 *  title?: string,
 *  description?: string|null,
 *  priority?: number,
 *  color?: string,
 *  due_date?: string,
 *  dashboard_id?: number,
 * assigned_to?: number
 * }} TTask
 */

/** Type Response
 * @typedef {{
 *  updated_at?: string,
 *  created_at?: string,
 *  message?: string
 * }} TResponse
 */
