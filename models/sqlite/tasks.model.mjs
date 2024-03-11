//@ts-ignore
import { placeholderQuery } from "../../utils/slq-placeholder.mjs";
import { db } from "./config/database.local.mjs";
import { USER_TABLE } from "./user.model.mjs";

/** Name of table */
const TABLE = "tasks";

/** Tasks model SQLite */
export class Task {
  /** Get all tasks */
  findAllTasks() {
    return new Promise((res, rej) => {
      const sql = `SELECT * FROM ${TABLE}`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          rej(err);
        } else {
          res(rows);
        }
      });
    });
  }

  /** Get a tasks by author_id
   * @param {number} id - Author_id
   */
  findTasksByAuthorId(id) {
    return new Promise((res, rej) => {
      const sql = `SELECT * FROM ${TABLE} WHERE author_id = ?`;
      db.all(sql, [id], (err, rows) => {
        if (err) {
          rej(err);
        } else {
          res(rows);
        }
      });
    });
  }

  /** Get id of author by email
   * @param {string} email - Author email
   */
  getIdAuthor(email) {
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

  /** Create a task
   * @param {TTask} data
   */
  createNewTask(data) {
    return new Promise((res, rej) => {
      const placeholder = placeholderQuery(data);

      const sql = `INSERT INTO ${TABLE} (${
        placeholder[0]
      }) VALUES(${placeholder[1].map(() => "?")})`;

      db.run(sql, [...placeholder[1]], (err) => {
        if (err) {
          rej(err);
        } else {
          const sql2 = `SELECT * FROM ${TABLE} WHERE author_id = ?`;
          db.get(sql2, placeholder[1].slice(-1), (err, row) => {
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
}

/**
 * @typedef {{
 *  title?: string,
 *  description?: string,
 *  status?: string,
 *  priority?: string,
 *  author_id?: string,
 *  updated_at?: string
 *  due_date?: string
 * }} TTask
 */
