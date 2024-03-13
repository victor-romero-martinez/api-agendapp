//@ts-ignore
import { placeholderQuery } from "../../utils/slq-placeholder.mjs";
import { db } from "./config/database.local.mjs";
import { USER_TABLE } from "./user.model.mjs";

/** Name of table */
const TASK_TABLE = "tasks";

/** Tasks model SQLite */
export class Task {
  /** Get all tasks
   * @returns {Promise<Array<TTask>>}
   */
  findAllTasks() {
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
   * @returns {Promise<Array<TTask>>}
   */
  findTasksByAuthorId(id) {
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
   * @returns {Promise<TTask>}
   */
  getTaskById(id) {
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
   * @returns {Promise<TTask>}
   */
  createNewTask(data) {
    return new Promise((res, rej) => {
      const placeholder = placeholderQuery(data);

      const sql = `INSERT INTO ${TASK_TABLE} (${
        placeholder[0]
      }) VALUES(${placeholder[1].map(() => "?")})`;

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
  }

  /** Update a task [TODO]
   * @param {TTask} data
   * @param {number} id
   * @returns {Promise<TTask>}
   */
  updateTask(data, id) {
    return new Promise((res, rej) => {
      const placeholder = placeholderQuery(data, "UPDATE");
      const sql = `UPDATE ${TASK_TABLE} SET ${placeholder[0]} WHERE id = ?`;

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
  }

  /** Get id of author by email
   * @param {string} email - Author email
   * @returns {Promise<{id: number}>}
   */
  getAuthorID(email) {
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
}

/**
 * @typedef {{
 *  title?: string,
 *  description?: string,
 *  status?: string,
 *  priority?: number,
 *  author_id?: number,
 *  due_date?: string
 *  updated_at?: string,
 *  created_at?: string
 * }} TTask
 */
