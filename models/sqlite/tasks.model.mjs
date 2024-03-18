//@ts-check
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
    return new Promise((res, rej) => {
      const sql = `SELECT * FROM ${TASK_TABLE} WHERE author_id = ?`;
      db.all(sql, [id], (err, rows) => {
        if (err) {
          rej(err);
        } else {
          res(rows);
        }
      });
    });
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

      const placeholder = placeholderQuery(data);

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
      const authorId = await this.#getAuthorID(email);

      if (!authorId) return { message: "User does not exists." };
      if (!data.id) return { message: "Task does not exists." };

      const checkSql = await this.#checkAuthor(data.id, authorId.id);

      if (!checkSql) return { message: "Unauthorize." };

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

  /** Delete a task
   * @param {number} taskId - Id of tasks
   * @param {string} email - Id of author
   * @returns {Promise<TTask&TResponse>}
   */
  async delete(taskId, email) {
    try {
      const authorId = await this.#getAuthorID(email);

      if (!authorId) return { message: "User does not exists." };

      const checkSql = await this.#checkAuthor(taskId, authorId.id);

      if (!checkSql) return { message: "Unauthorize." };

      return new Promise((res, rej) => {
        const sql = `DELETE FROM ${TASK_TABLE} WHERE id = ? AND author_id = ?`;
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

  /** Check author of task
   * @param {number} idTask
   * @param {number} idAuthor
   * @returns {Promise<{title:string}>}
   */
  #checkAuthor(idTask, idAuthor) {
    return new Promise((res, rej) => {
      const checkSql = `SELECT title FROM ${TASK_TABLE} WHERE id = ? AND author_id = ?`;

      db.get(checkSql, [idTask, idAuthor], (err, row) => {
        if (err) {
          rej(err);
        } else {
          res(row);
        }
      });
    });
  }

  /** Find owner id of dashboard
   * @param {number} id
   * @returns {Promise<{owner_id: number}>}
   */
  #findDashboardById(id) {
    return new Promise((res, rej) => {
      const sql = `SELECT owner_id FROM ${DASHBOARD_TABLE} WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
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
 *  dashboard_id?: number
 * }} TTask
 */

/** Type Response
 * @typedef {{
 *  updated_at?: string,
 *  created_at?: string
 *  author_id?: number,
 *  message?: string
 * }} TResponse
 */
