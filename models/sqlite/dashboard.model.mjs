// @ts-check
import { db } from "./config/database.local.mjs";

/** Name of table */
const DASHBOARD_TABLE = "dashboard";

/** Dashboard model SQLite */
export class Dashboard {
  /** Find all dashboard by email
   * @param {string} email
   */
  async findDashboardByEmail(email) {
    try {
      const userId = await this.#getIdByEmail(email);
      if (!userId) {
        return { message: "User does not exists." };
      }

      return new Promise((res, rej) => {
        const sql = `SELECT * FROM dashboard WHERE owner_id = ?;`;
        db.all(sql, [userId.id], (err, rows) => {
          if (err) {
            rej(err);
          } else {
            res(rows);
          }
        });
      });
    } catch (error) {
      throw Error(error);
    }
  }

  /** Create a new dashboard
   * @param {TDashboard} data
   * @param {string} email
   * @returns {Promise<TDashboard&TDashboardResponse>}
   */
  async createDashboard(data, email) {
    try {
      const userId = await this.#getIdByEmail(email);

      return new Promise((res, rej) => {
        if (!userId) {
          res({ message: "User does not exists." });
        } else {
          const { id } = userId;
          const sql = `INSERT INTO dashboard (name, owner_id) VALUES (?, ?);`;

          db.run(sql, [data.name, id], function (err) {
            if (err) {
              rej(err);
            } else {
              const id = this.lastID;
              const slq2 = `SELECT * FROM dashboard WHERE id = ?;`;
              db.get(slq2, [id], (err, row) => {
                if (err) {
                  rej(err);
                } else {
                  res(row);
                }
              });
            }
          });
        }
      });
    } catch (error) {
      throw Error(error);
    }
  }

  /** Update name
   * @param {TDashboard} data
   * @param {string} email
   * @returns {Promise<TDashboard&TDashboardResponse>}
   */
  async update(data, email) {
    try {
      const author = await this.#getIdByEmail(email);
      if (!author) {
        return { message: "User does not exists." };
      }

      return new Promise((res, rej) => {
        const authorId = author.id;

        const sql = `SELECT owner_id FROM dashboard WHERE id = ?;`;
        db.get(sql, [authorId], (err, row) => {
          if (err) {
            rej(err);
          } else {
            if (author.id !== data.id) {
              res({ message: "Unauthorized." });
            }

            const sql2 = `UPDATE dashboard SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`;
            db.run(sql2, [data.name, data.id], function (err) {
              if (err) {
                rej(err);
              } else {
                const sql3 = `SELECT * FROM dashboard WHERE id = ?;`;
                db.get(sql3, [data.id], (err, row) => {
                  if (err) {
                    rej(err);
                  } else {
                    res(row);
                  }
                });
              }
            });
          }
        });
      });
    } catch (error) {
      throw Error(error);
    }
  }

  // [TODO] borrar

  /** Get id by email
   * @param {string} email
   * @returns {Promise<{ id: number }>}
   */
  #getIdByEmail(email) {
    return new Promise((res, rej) => {
      const getId = `SELECT id FROM user WHERE email = ?;`;
      db.get(getId, [email], (err, row) => {
        if (err) {
          rej(err);
        } else {
          res(row);
        }
      });
    });
  }
}

/** Dashboard input
 *  @typedef {{
 * name?: string,
 * id?: number,
 * }} TDashboard
 */

/** Dashboard response
 *  @typedef {{
 * owner_id?: number,
 * updated_at?: string
 * created_at?: string
 * message?: string
 * }} TDashboardResponse
 */
