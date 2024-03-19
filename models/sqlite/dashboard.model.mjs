// @ts-check
import { db } from "./config/database.local.mjs";
import { USER_TABLE } from "./user.model.mjs";

/** Name of table */
export const DASHBOARD_TABLE = "dashboard";

/** Dashboard model SQLite */
export class Dashboard {
  /** Find all dashboard by email
   * @param {string} email
   */
  async groupByEmail(email) {
    try {
      const userId = await this.#getIdByEmail(email);
      if (!userId) {
        return { message: "User does not exists." };
      }

      return new Promise((res, rej) => {
        const sql = `SELECT * FROM ${DASHBOARD_TABLE} WHERE owner_id = ?;`;
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
  async create(data, email) {
    try {
      const userId = await this.#getIdByEmail(email);

      return new Promise((res, rej) => {
        if (!userId) {
          res({ message: "User does not exists." });
        } else {
          const { id } = userId;
          const sql = `INSERT INTO ${DASHBOARD_TABLE} (name, owner_id) VALUES (?, ?);`;

          db.run(sql, [data.name, id], function (err) {
            if (err) {
              rej(err);
            } else {
              const id = this.lastID;
              const slq2 = `SELECT * FROM ${DASHBOARD_TABLE} WHERE id = ?;`;
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
        const sql = `SELECT owner_id FROM ${DASHBOARD_TABLE} WHERE id = ?;`;
        db.get(sql, [data.id], (err, row) => {
          if (err) {
            rej(err);
          } else if (!row) {
            res({ message: "Forbidden." });
          } else if (author.id !== row.owner_id) {
            res({ message: "Unauthorized." });
          } else {
            const sql2 = `UPDATE ${DASHBOARD_TABLE} SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`;
            db.run(sql2, [data.name, data.id], function (err) {
              if (err) {
                rej(err);
              } else {
                const sql3 = `SELECT * FROM ${DASHBOARD_TABLE} WHERE id = ?;`;
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

  /** Delete a dashboard
   * @param {{ email: string, id: number }} data
   * @returns {Promise<TDashboardResponse>}
   */
  async delete(data) {
    try {
      const author = await this.#getIdByEmail(data.email);
      if (!author) {
        return { message: "User does not exists." };
      }

      return new Promise((res, rej) => {
        const sql = `SELECT owner_id FROM ${DASHBOARD_TABLE} WHERE id = ?;`;
        db.get(sql, [data.id], (err, row) => {
          if (err) {
            rej(err);
          } else if (!row) {
            res({ message: "Dashboard does not exists." });
          } else if (author.id !== row.owner_id) {
            res({ message: "Unauthorized." });
          } else {
            const sql2 = `DELETE FROM ${DASHBOARD_TABLE} WHERE id = ?;`;
            db.run(sql2, [data.id], (err) => {
              if (err) {
                rej(err);
              } else {
                res({ message: `Deleted ${DASHBOARD_TABLE} id: ${data.id}` });
              }
            });
          }
        });
      });
    } catch (error) {
      throw Error(error);
    }
  }

  /** Get id by email
   * @param {string} email
   * @returns {Promise<{ id: number }>}
   */
  #getIdByEmail(email) {
    return new Promise((res, rej) => {
      const getId = `SELECT id FROM ${USER_TABLE} WHERE email = ?;`;
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
