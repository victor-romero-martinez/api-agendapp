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
      db.all(sql, [email], (err, row) => {
        if (err) {
          rej(err);
        } else {
          res(row);
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
  // delete
  // update
}

/**
 * @typedef {{
 * id?: number,
 * author_id?: number,
 * members?: string[],
 * updated_at?: string,
 * created_at?: string,
 * }} TTeam
 */
