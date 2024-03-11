// @ts-check
import { db } from "./config/database.local.mjs";

const fieldsDB = [
  "id",
  "email",
  "user_name",
  "url_img",
  "role",
  "active",
  "verified",
  "created_at",
  "updated_at",
];
/** fields fn query */
function sqlPlaceholder() {
  let sqlStr = "";
  fieldsDB.forEach((f) => (sqlStr += `${f}, `));
  return sqlStr.slice(0, -2);
}

/** User model SQLite */
export class User {
  /** Get all user */
  findAllUser() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT ${sqlPlaceholder()} FROM users`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /** Get user by email
   * @param {TUser} data
   */
  findUserByEmail(data) {
    return new Promise((res, rej) => {
      const sql = `SELECT ${sqlPlaceholder()} FROM users WHERE email = ?`;
      db.get(sql, [data.email], (err, rows) => {
        if (err) {
          rej(err);
        } else {
          res(rows);
        }
      });
    });
  }

  /** Create a new account
   * @param {TUser} data
   */
  createUser(data) {
    return new Promise((res, rej) => {
      const sql = `INSERT INTO users (email, password) VALUES(?, ?)`;
      db.run(sql, [data.email, data.password], function (err) {
        if (err) {
          rej(err);
        } else {
          const id = this.lastID; // obtiene el ID de la fila insertada
          const sql2 = `SELECT ${sqlPlaceholder()} FROM users WHERE id = ?`;
          db.get(sql2, [id], (err, row) => {
            if (err) {
              rej(err);
            } else {
              res(row); // devuelve la fila insertada
            }
          });
        }
      });
    });
  }

  /** Update a user
   * @param {TUser} data
   * @param {number} id
   */
  updateUser(data, id) {
    return new Promise((res, rej) => {
      let placeholder = [];
      let params = [];

      for (const [key, value] of Object.entries(data)) {
        placeholder.push(key + " = ?");
        params.push(value);
      }

      const sql = `UPDATE users SET ${placeholder} WHERE id = ?`;
      db.run(sql, [...params, id], function (err) {
        if (err) {
          rej(err);
        } else {
          const sql2 = `SELECT ${sqlPlaceholder()} FROM users WHERE id = ?`;

          db.get(sql2, [id], (err, row) => {
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

  /** Delete an account
   * @param {TUser} data
   */
  deleteUser(data) {
    return new Promise((res, rej) => {
      // const sql = `DELETE FROM users WHERE id = ?`;
      const sql = `UPDATE users SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      db.run(sql, [data.id], function (err) {
        if (err) {
          rej(err);
        } else {
          res({ message: `Disable successfully id: ${data.id}` });
        }
      });
    });
  }
}

/**
 * @typedef {{
 * id?: number,
 * email?: string,
 * password?: string,
 * user_name?: string,
 * url_img?: string,
 * active?: boolean,
 * token_email?: string,
 * updated_at?: string|Date
 * }} TUser
 */
