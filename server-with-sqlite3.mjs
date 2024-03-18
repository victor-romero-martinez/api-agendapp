import { createApp } from "./index.mjs";
import { Task } from "./models/sqlite/tasks.model.mjs";
import { User } from "./models/sqlite/user.model.mjs";
import { Dashboard } from "./models/sqlite/dashboard.model.mjs";

const userModel = new User();
const taskModel = new Task();
const dashboardModel = new Dashboard();

createApp({ userModel, taskModel, dashboardModel });
