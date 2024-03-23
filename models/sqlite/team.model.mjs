// @ts-check
import { placeholderQuery } from "../../utils/slq-placeholder.mjs";
import { db } from "./config/database.local.mjs";
import { USER_TABLE } from "./user.model.mjs";

/** Name od table */
export const TEAM_TABLE = "team";

/** Parse JSON */
function convertStringToArray(data) {
  const dataConverted = [];

  for (const d of data) {
    const toArray = JSON.parse(d.members);
    dataConverted.push({ ...d, members: toArray });
  }

  return dataConverted;
}

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
          const convertToArray = convertStringToArray(rows);
          res(convertToArray);
        }
      });
    });
  }

  // * @param {number[]|undefined} data
  /** Create team
   * @param {{
   * organization: string,
   * members: number[]
   * }} data
   * @param {string} email
   * @returns {Promise<TTeam>}
   */
  async create(data, email) {
    try {
      const isExistUsers = await this.#checkUsersExist(data.members);
      if (isExistUsers.result == false) {
        return { message: "Some users were not found or do not exist." };
      }

      return new Promise((res, rej) => {
        // require string to save
        const toString = JSON.stringify(data.members);
        const placeholder = placeholderQuery({
          ...data,
          members: toString,
        });

        const sql = `INSERT INTO ${TEAM_TABLE} (${
          placeholder[0]
        },author_id) VALUES (${placeholder[1].map(
          () => "?"
        )},(SELECT id FROM ${USER_TABLE} WHERE email = ?));`;

        db.run(sql, [...placeholder[1], email], function (err) {
          if (err) {
            rej(err);
          } else {
            const id = this.lastID;

            const sql2 = `SELECT * FROM ${TEAM_TABLE} WHERE id = ?;`;
            db.get(sql2, [id], (err, row) => {
              if (err) {
                rej(err);
              } else {
                const convertToArray = JSON.parse(row.members);
                const newRow = { ...row, members: convertToArray };
                res(newRow);
              }
            });
          }
        });
      });
    } catch (error) {
      throw Error(error);
    }
  }

  /** Delete team
   * @param {TTeam} data
   * @param {string} email
   * @returns {Promise<TTeam>}
   */
  async delete(data, email) {
    try {
      // @ts-ignore
      const isExist = await this.#getTeam(data.id);
      if (!isExist) return { message: "Team does not exists." };

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

  /** update team member
   * @param {{
   * id: number,
   * members: number[],
   * action: 'add' | 'remove'
   * }} data
   * @param {string} email
   * @returns {Promise<TTeam>}
   */
  async update(data, email) {
    try {
      const team = await this.#getTeam(data.id);
      if (!team.members) {
        throw Error("Member is empty.");
      }

      // check authorization
      const isAuthorized = await this.#getAuthorization(data.id, email);
      if (isAuthorized.authorized == false) {
        return { message: "Unauthorized." };
      }

      if (data.action === "add") {
        // search if exist user
        const isExistUsers = await this.#checkUsersExist(data.members);
        if (isExistUsers.result == false) {
          return { message: "Some users were not found or do not exist." };
        }

        const parseNewMembers = new Set([...team.members, ...data.members]);
        const covertToString = JSON.stringify(Array.from(parseNewMembers));

        return await this.#updater(covertToString, data.id);
      } else {
        const filteredMembers = team.members.filter(
          (m) => !data.members.includes(m)
        );
        const convertedToString = JSON.stringify(filteredMembers);

        return await this.#updater(convertedToString, data.id);
      }
    } catch (error) {
      throw Error(error);
    }
  }

  /** Find team
   * @param {number} id
   * @returns {Promise<TTeam>}
   */
  #getTeam(id) {
    return new Promise((res, rej) => {
      const sql = `SELECT * FROM ${TEAM_TABLE} WHERE id = ?;`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          rej(err);
        } else {
          const toArray = JSON.parse(row.members);
          const newRow = {
            ...row,
            members: toArray,
          };
          res(newRow);
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

  /** Find all user exists by `ids`
   * @param {number[]} ids - `user's id`
   * @returns {Promise<{result: boolean}>}
   */
  #checkUsersExist(ids) {
    return new Promise((res, rej) => {
      const quantityExpected = ids.length;
      const sql = `SELECT CASE WHEN COUNT(*) = ${quantityExpected} THEN 1 ELSE 0 END AS result FROM ${USER_TABLE} WHERE id IN (${ids.map(
        (i) => "?"
      )}) AND active = 1;`;

      db.get(sql, [...ids], (err, row) => {
        if (err) {
          rej(err);
        } else {
          res(row);
        }
      });
    });
  }

  /** Updater class
   * @param {string} data
   * @param {number} id
   * @returns {Promise<TTeam>}
   */
  #updater(data, id) {
    return new Promise((res, rej) => {
      const sql = `UPDATE ${TEAM_TABLE} SET members = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`;
      db.run(sql, [data, id], (err) => {
        if (err) {
          rej(err);
        }
      });

      this.#getTeam(id)
        .then((result) => res(result))
        .catch((e) => rej(e));
    });
  }
}

/**
 * @typedef {{
 * id?: number,
 * author_id?: number,
 * organization?: string
 * members?: number[],
 * updated_at?: string,
 * created_at?: string,
 * message?: string
 * }} TTeam
 */
