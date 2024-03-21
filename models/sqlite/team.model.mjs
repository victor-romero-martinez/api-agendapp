// @ts-check
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
   *  id: number,
   * add?: number[],
   * remove?: number
   * }} data
   * @param {string} email
   * @returns {Promise<TTeam>}
   */
  async update(data, email) {
    try {
      const checkTeam = await this.#getTeam(data.id);
      if (!checkTeam) return { message: "Team does not exists." };

      const authorization = await this.#getAuthorization(data.id, email);
      if (authorization.authorized == false) {
        return { message: "Unauthorized." };
      }

      const { add, remove = 0, id } = data;
      const newData = {
        id,
        members: add ? add : remove,
      };

      if (!checkTeam.members) throw Error("Should be have [].");
      /** @type {number[]} */
      const membersParse = JSON.parse(checkTeam.members);

      if (newData.members === add) {
        const isUsersExists = await this.#checkUsersExist(newData.members);
        if (isUsersExists.result == false) {
          return { message: "Some users were not found or do not exist." };
        }

        const deletedDuplicate = new Set([...membersParse, ...newData.members]);
        const convertedToArray = Array.from(deletedDuplicate);
        // should be string to save
        const convertedToString = JSON.stringify(convertedToArray);

        return await this.#updater(convertedToString, id);
      } else {
        if (typeof membersParse === "string")
          throw Error("Expected an Array but receive a string.");

        const filteredMembers = membersParse.filter(
          (m) => m != newData.members
        );
        const convertedToString = JSON.stringify(filteredMembers);

        return await this.#updater(convertedToString, id);
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

  /** Find all user exists by `ids`
   * @param {number[]} ids - `user's id`
   * @returns {Promise<{result: boolean}>}
   */
  #checkUsersExist(ids) {
    return new Promise((res, rej) => {
      const quantityExpected = ids.length;
      const sql = `SELECT CASE WHEN COUNT(*) = ${quantityExpected} THEN 1 ELSE 0 END AS result FROM ${USER_TABLE} WHERE id IN (${ids.map(
        (i) => "?"
      )});`;

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
      const sql = `UPDATE team SET members = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`;
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
 * members?: string,
 * updated_at?: string,
 * created_at?: string,
 * message?: string
 * }} TTeam
 */
