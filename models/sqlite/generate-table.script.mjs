import { logHelper } from "../../utils/log-helper.mjs";
import { db } from "./config/database.local.mjs";

(() => {
  const queries = [
    "DROP TABLE IF EXISTS user;",
    "DROP TABLE IF EXISTS dashboard;",
    "DROP TABLE IF EXISTS task;",
    "DROP TABLE IF EXISTS team;",
    "CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, user_name TEXT(60), email TEXT(255) NOT NULL UNIQUE, password TEXT(255) NOT NULL, url_img TEXT, role TEXT NOT NULL DEFAULT 'user', active BOOLEAN NOT NULL DEFAULT 1, verified BOOLEAN NOT NULL DEFAULT 0, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, token_email TEXT);",
    "CREATE TABLE dashboard (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, owner_id INTEGER NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(owner_id) REFERENCES user(id));",
    "CREATE TABLE task (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT(60) NOT NULL, description TEXT(255), status TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, due_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, assigned_to INTEGER NOT NULL, dashboard_id INTEGER NOT NULL, FOREIGN KEY(assigned_to) REFERENCES user(id), FOREIGN KEY(dashboard_id) REFERENCES dashboard(id));",
    "CREATE TABLE team (id INTEGER PRIMARY KEY AUTOINCREMENT, author_id INTEGER NOT NULL, members TEXT NOT NULL,  serán una lista de IDs de usuario role TEXT NOT NULL DEFAULT 'member', created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(author_id) REFERENCES user(id));",
  ];

  queries.forEach((query) => {
    db.serialize(() => {
      db.run(query, (err) => {
        if (err) {
          logHelper("error ☠", err);
        } else {
          logHelper("success 🎉", "Query executed successfully");
        }
      });
    });
  });
})();
