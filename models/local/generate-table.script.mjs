import { logHelper } from "../../utils/log-helper.mjs";
import { db } from "./database.local.mjs";

function generate() {
  const drop = `DROP TABLE IF EXISTS users`;

  const create = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    username TEXT
  )`;

  db.exec(drop, (err) => {
    if (err) {
      logHelper("error ☠", err);
    }
    logHelper("success 🎉", "Draped");
  });

  db.run(create, (err) => {
    if (err) {
      logHelper("error ☠", err);
    }
    logHelper("success 🎉", "Created");
  });

  db.close();
}

generate();
