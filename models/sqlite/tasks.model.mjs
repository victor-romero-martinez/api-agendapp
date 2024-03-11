import { db } from "./config/database.local.mjs";

/** Bame of table */
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
  findTasksNyAuthor(id) {
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
}
