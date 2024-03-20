import { createApp } from "./index.mjs";
import { Dashboard } from "./models/sqlite/dashboard.model.mjs";
import { Task } from "./models/sqlite/tasks.model.mjs";
import { Team } from "./models/sqlite/team.model.mjs";
import { User } from "./models/sqlite/user.model.mjs";

const userModel = new User();
const taskModel = new Task();
const dashboardModel = new Dashboard();
const teamModel = new Team();

createApp({ userModel, taskModel, dashboardModel, teamModel });
