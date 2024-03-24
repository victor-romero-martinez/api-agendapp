/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      allOf:
 *        - $ref: '#/components/UserEditable'
 *        - $ref: '#/components/UserNoEditable'
 *    Auth:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          format: email
 *        password:
 *          type: string
 *          format: password
 *    Task:
 *      allOf:
 *         - $ref: '#/components/TaskEditable'
 *         - $ref: '#/components/TaskNoEditable'
 *    Team:
 *      allOf:
 *         - $ref: '#/components/TeamEditable'
 *         - $ref: '#/components/TeamNoEditable'
 *    Dashboard:
 *      allOf:
 *        - $ref: '#/components/DashboardEditable'
 *        - $ref: '#/components/DashboardNoEditable'
 *  UserEditable:
 *    type: object
 *    properties:
 *      email:
 *        type: string
 *        format: email
 *      user_name:
 *        type: string
 *        format: name
 *      url_img:
 *        type: string
 *        format: uri
 *  UserNoEditable:
 *    type: object
 *    properties:
 *      id:
 *        type: integer
 *        format: int64
 *      role:
 *        type: string
 *      active:
 *        type: string
 *        format: boolean
 *        default: true
 *      verify:
 *        type: string
 *        format: bolean
 *        default: false
 *      updated_ad:
 *        type: string
 *        format: date
 *      created_ad:
 *        type: string
 *        format: date
 *  TaskEditable:
 *    type: object
 *    properties:
 *      title:
 *        type: string
 *      description:
 *        type: string
 *      color:
 *        type: string
 *      priority:
 *        type: integer
 *        default: 1
 *      due_date:
 *        type: string
 *        format: date
 *  TaskNoEditable:
 *    type: object
 *    properties:
 *      id:
 *        type: integer
 *      author_id:
 *        type: integer
 *      created_at:
 *        type: string
 *        format: date
 *      updated_at:
 *        type: string
 *        format: date
 *  TeamEditable:
 *    type: object
 *    properties:
 *      organization:
 *        type: string
 *      members:
 *        type: array
 *        items:
 *          type: integer
 *        example: [1, 2, 3]
 *  TeamNoEditable:
 *    type: object
 *    properties:
 *      id:
 *        type: integer
 *      author_id:
 *        type: integer
 *      created_at:
 *        type: string
 *        format: date
 *      updated_at:
 *        type: string
 *        format: date
 *  DashboardEditable:
 *    type: object
 *    properties:
 *      name:
 *        type: string
 *  DashboardNoEditable:
 *    type: object
 *    properties:
 *      id:
 *        type: integer
 *      owner_id:
 *        type: integer
 *      created_at:
 *        type: string
 *        format: date
 *      updated_at:
 *        type: string
 *        format: date
 */
//@ts-check
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.mjs";
import { DashboardController } from "../controllers/dashboard.controller.mjs";
import { TaskController } from "../controllers/task.controller.mjs";
import { TeamController } from "../controllers/team.controller.mjs";
import { UserController } from "../controllers/user.controller.mjs";
import jwtMiddleware from "../middlewares/jwt.middleware.mjs";

/** App router
 * @param {{
 * userModel: import('../models/sqlite/user.model.mjs').User,
 * taskModel: import('../models/sqlite/tasks.model.mjs').Task,
 * dashboardModel: import('../models/sqlite/dashboard.model.mjs').Dashboard,
 * teamModel: import('../models/sqlite/team.model.mjs').Team
 * }} param
 */
export const appRouter = ({
  userModel,
  taskModel,
  dashboardModel,
  teamModel,
}) => {
  const router = Router();

  const authController = new AuthController({ userModel });
  const userController = new UserController({ userModel });
  const taskController = new TaskController({ taskModel });
  const dashboardController = new DashboardController({ dashboardModel });
  const teamController = new TeamController({ teamModel });

  /**
   * @swagger
   * /user:
   *  get:
   *    summary: Get all Users.
   *    tags: [User]
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: Response with all user
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/User'
   *      500:
   *        description: Internal Server Error.
   */
  router.get("/user", userController.findAll);
  /**
   * @swagger
   * /user:
   *  post:
   *    summary: Get a user by email.
   *    tags: [User]
   *    produces:
   *      - application/json
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                type: string
   *                format: email
   *    responses:
   *      200:
   *        description: Response a user.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/User'
   *      404:
   *        description: User does not exists.
   *      500:
   *        description: Internal Server Error.
   */
  router.post("/user", userController.getByEmail);
  /**
   * @swagger
   * /user:
   *  patch:
   *    summary: Update a profile.
   *    tags: [User]
   *    produces:
   *      - application/json
   *    security:
   *      - cookieAuth: []
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/UserEditable'
   *    responses:
   *      200:
   *        description: Response with user Updated.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/User'
   *      400:
   *        description: Bad Request.
   *      404:
   *        description: Missing user email.
   *      500:
   *        description: Internal Server Error.
   */
  router.patch("/user", jwtMiddleware, userController.update);
  /**
   * @swagger
   * /user:
   *  delete:
   *    summary: Disable profile.
   *    tags: [User]
   *    produces:
   *      - application/json
   *    security:
   *      - cookieAuth: []
   *    parameters:
   *      - in: query
   *        name: id
   *        schema:
   *          type: string
   *          format: number
   *          description: Id of profile
   *    responses:
   *      200:
   *        description: Response profile disable.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *      404:
   *        description: User not found.
   *      500:
   *        description: Internal Sever Error.
   */
  router.delete("/user", jwtMiddleware, userController.delete);

  // AUTH
  /**
   * @swagger
   * /register:
   *  post:
   *    summary: Register an account.
   *    tags: [Auth]
   *    produces:
   *      - application/json
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                type: string
   *                format: email
   *              password:
   *                type: string
   *    responses:
   *      201:
   *        description: Response with new user.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/User'
   *      404:
   *        description: Not Found.
   *      409:
   *        description: User is already exists.
   *      500:
   *        description: Internal Server Error.
   */
  router.post("/register", authController.register);
  /**
   * @swagger
   * /signing:
   *  post:
   *    summary: Signing to get auth.
   *    tags: [Auth]
   *    produces:
   *      - application/json
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                type: string
   *                format: email
   *              password:
   *                type: string
   *    responses:
   *      200:
   *        description: Get session auth.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/User'
   *      404:
   *        description: Not Found.
   *      401:
   *        description: Incorrect password or email.
   *      500:
   *        description: Internal Server Error.
   */
  router.post("/signing", authController.signing);
  /**
   * @swagger
   * /signout:
   *  get:
   *    summary: Close session.
   *    tags: [Auth]
   *    responses:
   *      200:
   *        description: Successfully.
   */
  router.get("/signout", authController.signout);

  // TASKS
  /**
   * @swagger
   * /task/{id}:
   *  get:
   *    summary: Get a task by id.
   *    tags: [Task]
   *    produces:
   *      - application/json
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: Get one task.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Task'
   *      400:
   *        description: Should be a number.
   *      404:
   *        description: Not Found.
   *      500:
   *        description: Internal Sever Error.
   */
  router.get("/task/:id", taskController.getById);
  /**
   * @swagger
   * /task:
   *  get:
   *    summary: Get all tasks.
   *    tags: [Task]
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: Get all tasks.
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                 $ref: '#/components/schemas/Task'
   *      500:
   *        description: Internal Sever Error.
   */
  router.get("/task", taskController.getAll);
  /**
   * @swagger
   * /task:
   *  post:
   *    summary: Create a new task.
   *    tags: [Task]
   *    produces:
   *      - application/json
   *    security:
   *      - cookieAuth: []
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/TaskEditable'
   *    responses:
   *      201:
   *        description: Response task created.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Task'
   *      401:
   *        description: Unauthorized.
   *      400:
   *        description: Bad Request.
   *      404:
   *        description: User does not exists.
   *      500:
   *        description: Internal Server Error.
   *
   */
  router.post("/task", jwtMiddleware, taskController.create);
  /**
   * @swagger
   * /task:
   *  patch:
   *    summary: Update a task.
   *    tags: [Task]
   *    produces:
   *      - application/json
   *    security:
   *      - cookieAuth: []
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *             $ref: '#/components/TaskEditable'
   *    responses:
   *      200:
   *        description: Response task update.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#components/schemas/Task'
   *      400:
   *        description: Bad Request.
   *      401:
   *        description: Unauthorized.
   *      404:
   *        description: Not Found.
   *      500:
   *        description: Internal Sever Error.
   */
  router.patch("/task", jwtMiddleware, taskController.update);
  /**
   * @swagger
   * /task:
   *  delete:
   *    summary: Delete  a task.
   *    tags: [Task]
   *    produces:
   *      - application/json
   *    security:
   *      - cookieAuth: []
   *    parameters:
   *      - in: query
   *        name: id
   *        required: true
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: Response Successfully.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *      400:
   *        description: Bad Request.
   *      401:
   *        description: Unauthorized.
   *      404:
   *        description: Not Found.
   *      500:
   *        description: Internal Server Error.
   */
  router.delete("/task", jwtMiddleware, taskController.delete);

  //  Dashboard
  /**
   * @swagger
   * /dashboard:
   *  get:
   *    summary: Get dashboard by email.
   *    description: Only if session exist.
   *    tags: [Dashboard]
   *    security:
   *      - cookieAuth: []
   *    produces:
   *      - application.json
   *    responses:
   *      200:
   *        description: Response with an array.
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/Dashboard'
   *      401:
   *        description: Unauthorized.
   *      404:
   *        description: User does not exists.
   *      500:
   *        description: Internal Server Error.
   */
  router.get("/dashboard", jwtMiddleware, dashboardController.groupByEmail);
  /**
   * @swagger
   * /dashboard:
   *  put:
   *    summary: Create a new dashboard.
   *    tags: [Dashboard]
   *    security:
   *      - cookieAuth: []
   *    produces:
   *      - application/json
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/DashboardEditable'
   *    responses:
   *      201:
   *        description: Response with the new dashboard.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Dashboard'
   *      400:
   *        description: Bad Request.
   *      401:
   *        description: Unauthorized.
   *      404:
   *        description: Not Found.
   *      500:
   *        description: Internal Server Error.
   */
  router.put("/dashboard", jwtMiddleware, dashboardController.create);
  /**
   * @swagger
   * /dashboard:
   *  patch:
   *    summary: Update a dashboard.
   *    tags: [Dashboard]
   *    security:
   *      - cookieAuth: []
   *    produces:
   *      - application/json
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/DashboardEditable'
   *    responses:
   *      201:
   *        description: Response with the updated dashboard.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Dashboard'
   *      400:
   *        description: Bad Request.
   *      401:
   *        description: Unauthorized.
   *      404:
   *        description: Not Found.
   *      500:
   *        description: Internal Server Error.
   */
  router.patch("/dashboard", jwtMiddleware, dashboardController.update);
  /**
   * @swagger
   * /dashboard:
   *  delete:
   *    summary: Delete a dashboard.
   *    tags: [Dashboard]
   *    security:
   *      - cookieAuth: []
   *    produces:
   *      - application/json
   *    parameters:
   *      - in: query
   *        required: true
   *        name: id
   *        schema:
   *          type: integer
   *    responses:
   *      201:
   *        description: Response with the new dashboard
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *      400:
   *        description: Bad Request.
   *      401:
   *        description: Unauthorized.
   *      404:
   *        description: Not Found.
   *      500:
   *        description: Internal Server Error.
   */
  router.delete("/dashboard", jwtMiddleware, dashboardController.delete);

  // Team
  /**
   * @swagger
   * /team:
   *  get:
   *    summary: Get me team.
   *    tags: [Team]
   *    security:
   *      - cookieAuth: []
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: Get all my team.
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/Team'
   *      500:
   *        description: Internal Server Error.
   */
  router.get("/team", jwtMiddleware, teamController.getTeam);
  /**
   * @swagger
   * /team:
   *  post:
   *    summary: Create a team.
   *    tags: [Team]
   *    security:
   *      - cookieAuth: []
   *    produces:
   *      - application/json
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/TeamEditable'
   *    responses:
   *      201:
   *        description: Response with the new team.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Team'
   *      400:
   *        description: Bad Request.
   *      404:
   *        description: Not Found.
   *      500:
   *        description: Internal Server Error.
   *
   */
  router.post("/team", jwtMiddleware, teamController.create);
  /**
   * @swagger
   * /team:
   *  patch:
   *    summary: Update a team.
   *    tags: [Team]
   *    security:
   *      - cookieAuth: []
   *    produces:
   *      - application/json
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/TeamEditable'
   *    responses:
   *      201:
   *        description: Response with the updated team.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Team'
   *      400:
   *        description: Bad Request.
   *      401:
   *        description: Unauthorized.
   *      404:
   *        description: Not Found.
   *      500:
   *        description: Internal Server Error.
   *
   */
  router.patch("/team", jwtMiddleware, teamController.update);
  /**
   * @swagger
   * /team:
   *  delete:
   *    summary: Delete a team.
   *    tags: [Team]
   *    security:
   *      - cookieAuth: []
   *    produces:
   *      - application/json
   *    parameters:
   *      - in: query
   *        required: true
   *        name: id
   *        schema:
   *          type: integer
   *    responses:
   *      200:
   *        description: Confirm delete.
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                message:
   *                  type: string
   *      400:
   *        description: Bad Request.
   *      401:
   *        description: Unauthorized.
   *      404:
   *        description: Not Found.
   *      500:
   *        description: Internal Server Error.
   */
  router.delete("/team", jwtMiddleware, teamController.delete);

  router.get("/verify", userController.verifyEmail);

  return router;
};
