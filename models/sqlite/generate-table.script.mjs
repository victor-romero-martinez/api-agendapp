import { logHelper } from "../../utils/log-helper.mjs";
import { db } from "./config/database.local.mjs";

function generate() {
  const createTableUser = `
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      email       TEXT UNIQUE NOT NULL CHECK(length(email) <= 60),
      password    TEXT NOT NULL CHECK(length(password) >= 4 AND length(password) <= 60),
      user_name   TEXT CHECK(length(user_name) >= 2 AND length(user_name) <= 60),
      url_img     TEXT,
      role        NOT NULL DEFAULT user,
      active      BOOLEAN NOT NULL DEFAULT true,
      verified    BOOLEAN NOT NULL DEFAULT false,
      token_email TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`;

  const createTableTasks = `
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL CHECK(length(title) >= 3 AND length(title) <= 60),
      description TEXT CHECK(length(description) <= 250),
      status      TEXT NOT NULL DEFAULT pending,
      author_id   INTEGER NOT NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      due_date    DATE NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users (id)
    )`;

  db.serialize(() => {
    db.run(createTableUser, (err) => {
      if (err) {
        logHelper("error ☠", err);
      }
      logHelper("success 🎉", "Created table users");
    })
      .run(createTableTasks, (err) => {
        if (err) {
          logHelper("error ☠", err);
        }
        logHelper("success 🎉", "Created table tasks");
      })
      .close();
  });
}

function drop() {
  const tables = ["users", "tasks"];

  tables.forEach((t) => {
    const drop = `DROP TABLE IF EXISTS ${t}`;
    db.run(drop, (err) => {
      if (err) {
        logHelper("error ☠", err);
      }
      logHelper("success 🎉", `Dropped tables ${t}`);
    });
  });
}

drop();
generate();
