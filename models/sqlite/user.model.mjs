// @ts-check
import "dotenv/config";
import { Cipher } from "../../utils/cipher.mjs";
import { db } from "./config/database.local.mjs";
import { placeholderQuery } from "../../utils/slq-placeholder.mjs";

const SECRET = process.env.SECRET;
/** Name of the table */
export const USER_TABLE = "user";

if (!SECRET) throw Error("Missing cipher secret .env");
const cipher = new Cipher(SECRET);

/** fields query returns */
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
/** fields fn query returns */
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
      const sql = `SELECT ${sqlPlaceholder()} FROM ${USER_TABLE}`;
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
   * @returns {Promise<TUser&TResponse>}
   */
  findUserByEmail(data) {
    return new Promise((res, rej) => {
      const sql = `SELECT ${sqlPlaceholder()} FROM ${USER_TABLE} WHERE email = ?`;
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
   * @param {{ email: string, password: string, token_email: string }} data
   * @returns {Promise<TUser&TResponse>}
   */
  async createUser(data) {
    try {
      const isAlreadyExist = await this.findUserByEmail(data);

      if (isAlreadyExist) {
        if (isAlreadyExist.email && isAlreadyExist.active == false) {
          return await this.updateUser({ active: true }, isAlreadyExist.email);
        } else if (isAlreadyExist.active == true) {
          return { message: "User is already exists." };
        }
      }

      // for new user
      const password = cipher.generate(data.password);

      return new Promise((res, rej) => {
        const sql = `INSERT INTO ${USER_TABLE} (email, token_email, password) VALUES(?, ?, ?)`;
        db.run(sql, [data.email, data.token_email, password], function (err) {
          if (err) {
            rej(err);
          } else {
            const id = this.lastID; // obtiene el ID de la fila insertada
            const sql2 = `SELECT ${sqlPlaceholder()} FROM ${USER_TABLE} WHERE id = ?`;
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
    } catch (error) {
      throw error;
    }
  }

  /** Update a user
   * @param {TUser} data
   * @param {string} email
   * @returns {Promise<TUser&TResponse>}
   */
  async updateUser(data, email) {
    try {
      const user = await this.getSession(email);

      if (!user.password || !user.id) {
        return { message: "Failed to update user." };
      }

      if (data.password && data.new_password) {
        const isAuthorized = cipher.compare(data.password, user.password);

        if (!isAuthorized) return { message: "Incorrect password." };

        const newPassword = cipher.generate(data.new_password);

        if (!newPassword) return { message: "Failed to update user." };

        const { new_password, ...dataClean } = data;
        const dataPrepare = { ...dataClean, password: newPassword };

        const userUpdated = await this.#updater(dataPrepare, user.id);
        return userUpdated;
      } else {
        const { password, new_password, ...newData } = data;

        const userUpdated = await this.#updater(newData, user.id);
        return userUpdated;
      }
    } catch (error) {
      throw error;
    }
  }

  /** Delete an account
   * @param {number} id
   * @param {string} email
   * @returns {Promise<{ message: string}>}
   */
  async deleteUser(id, email) {
    try {
      const userId = await this.#getUseId(email);

      if (!userId) return { message: "User does not exists." };

      if (id !== userId.id) return { message: "Unauthorize." };

      return new Promise((res, rej) => {
        // const sql = `DELETE FROM ${TABLE} WHERE id = ?`;
        const sql = `UPDATE ${USER_TABLE} SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        db.run(sql, [userId.id], function (err) {
          if (err) {
            rej(err);
          } else {
            res({ message: `Disable successfully id: ${userId.id}` });
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  /** Get all fields by email
   * @param {string} email
   */
  getSession(email) {
    return new Promise((res, rej) => {
      const sql = `SELECT * FROM ${USER_TABLE} WHERE email = ?`;
      db.get(sql, [email], (err, row) => {
        if (err) {
          rej(err);
        } else {
          res(row);
        }
      });
    });
  }

  /** Updater class
   * @param {TUser} data
   * @param {number} id
   * @returns {Promise<TUser&TResponse>}
   */
  #updater(data, id) {
    return new Promise((res, rej) => {
      const placeholder = placeholderQuery(data, "UPDATE");

      const sql = `UPDATE ${USER_TABLE} SET ${placeholder[0]}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      db.run(sql, [...placeholder[1], id], function (err) {
        if (err) {
          rej(err);
        } else {
          const sql2 = `SELECT ${sqlPlaceholder()} FROM ${USER_TABLE} WHERE id = ?`;

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

  /** Get id of user
   * @param {string} email
   * @returns {Promise<{id: number}>}
   */
  #getUseId(email) {
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

/** Type input
 * @typedef {{
 * id?: number,
 * email?: string,
 * password?: string,
 * new_password?: string,
 * user_name?: string,
 * url_img?: string,
 * active?: boolean,
 * token_email?: string|null,
 * verified?: boolean,
 * }} TUser
 */

/** Type response
 * @typedef {{
 * role?: string,
 * updated_at?: string|Date,
 * created_at?: string,
 * message?: string
 * }} TResponse
 */
