import { createApp } from "./index.mjs";
import { Task } from "./models/sqlite/tasks.model.mjs";
import { User } from "./models/sqlite/user.model.mjs";

const userModel = new User();
const taskModel = new Task();

createApp({ userModel, taskModel });
