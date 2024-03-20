// @ts-check
import { placeholderQuery } from "../../utils/slq-placeholder.mjs";
import { db } from "./config/database.local.mjs";
import { USER_TABLE } from "./user.model.mjs";

/** Name od table */
export const TEAM_TABLE = "team";

/** Team model SQLite */
export class Team {
  /** Find team by email
   * @param {string} email
   * @returns {Promise<TTeam[]>}
   */
  get(email) {
    return new Promise((res, rej) => {
      const sql = `SELECT * FROM ${TEAM_TABLE} WHERE author_id = (SELECT id FROM ${USER_TABLE} WHERE email = ?);`;
      db.all(sql, [email], (err, rows) => {
        if (err) {
          rej(err);
        } else {
          res(rows);
        }
      });
    });
  }

  /** Create team
   * @param {number[]|undefined} data
   * @param {string} email
   * @returns {Promise<TTeam>}
   */
  create(data, email) {
    return new Promise((res, rej) => {
      const members = JSON.stringify(data);
      const param = data ? [members, email] : [email];

      const sql = `INSERT INTO ${TEAM_TABLE} (${
        data ? "members, " : ""
      }author_id) VALUES (${
        data ? "?, " : ""
      }(SELECT id FROM ${USER_TABLE} WHERE email = ?));`;

      db.run(sql, param, function (err) {
        if (err) {
          rej(err);
        } else {
          const id = this.lastID;

          const sql2 = `SELECT * FROM ${TEAM_TABLE} WHERE id = ?;`;
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

  /** Delete team
   * @param {TTeam} data
   * @param {string} email
   * @returns {Promise<TTeam>}
   */
  async delete(data, email) {
    try {
      // @ts-ignore
      const team = await this.#findTeam(data.id);
      if (!team) return { message: "Team does not exists." };

      // @ts-ignore
      const authorization = await this.#getAuthorization(data.id, email);
      if (authorization.authorized == false)
        return { message: "Unauthorized." };

      return new Promise((res, rej) => {
        const sql = `DELETE FROM ${TEAM_TABLE} WHERE id = ? AND author_id = (SELECT id FROM ${USER_TABLE} WHERE email = ?);`;
        db.run(sql, [data.id, email], (err) => {
          if (err) {
            rej(err);
          } else {
            res({ message: `Deleted successfully.` });
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }
  // update

  /** Find team
   * @param {number} id
   * @returns {Promise<TTeam>}
   */
  #findTeam(id) {
    return new Promise((res, rej) => {
      const sql = `SELECT * FROM ${TEAM_TABLE} WHERE id = ?;`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          rej(err);
        } else {
          res(row);
        }
      });
    });
  }

  /** Get authorization
   * @param {number} team_id
   * @param {string} email
   * @returns {Promise<{authorized: boolean}>}
   */
  #getAuthorization(team_id, email) {
    return new Promise((res, rej) => {
      const sql = `SELECT EXISTS (SELECT * FROM ${TEAM_TABLE} WHERE id = ? AND author_id = (SELECT id FROM ${USER_TABLE} WHERE email = ?)) AS authorized;`;
      db.get(sql, [team_id, email], (err, row) => {
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
 * id?: number,
 * author_id?: number,
 * members?: string[]|number[],
 * updated_at?: string,
 * created_at?: string,
 * message?: string
 * }} TTeam
 */
