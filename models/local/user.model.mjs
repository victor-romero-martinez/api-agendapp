import { db } from "./database.local.mjs";

export class User {
  // constructor({ model }) {
  //   this.model = model
  // }

  static findAll = () => {
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
  };

  static findOneByEmail = (data) => {
    return new Promise((res, rej) => {
      const sql = `SELECT email FROM users WHERE email = ?`;
      db.get(sql, [data.email], (err, rows) => {
        if (err) {
          rej(err);
        } else {
          res(rows);
        }
      });
    });
  };

  static create = async (data) => {
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
  };
}
