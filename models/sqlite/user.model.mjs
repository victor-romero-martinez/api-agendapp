// @ts-check
import { db } from "./database.local.mjs";

/** User model SQLite */
export class User {
  /** Get all user */
  static findAll() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /** Get user by email */
  static findOneByEmail(data) {
    return new Promise((res, rej) => {
      const sql = `SELECT * FROM users WHERE email = ?`;
      db.get(sql, [data.email], (err, rows) => {
        if (err) {
          rej(err);
        } else {
          res(rows);
        }
      });
    });
  }

  /** Create a new user */
  static create(data) {
    return new Promise((res, rej) => {
      const sql = `INSERT INTO users (password, email) VALUES (?, ?)`;
      db.run(sql, [data.password, data.email], (err) => {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      });
    });
  }
}
