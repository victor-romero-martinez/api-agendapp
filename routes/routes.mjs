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
 *        type: number
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
 *      status:
 *        type: string
 *        default: pending
 *      priority:
 *        type: number
 *        default: 1
 *      due_date:
 *        type: string
 *        format: date
 *  TaskNoEditable:
 *    type: object
 *    properties:
 *      id:
 *        type: number
 *      author_id:
 *        type: number
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
import { TaskController } from "../controllers/task.controller.mjs";
import { UserController } from "../controllers/user.controller.mjs";
import jwtMiddleware from "../middlewares/jwt.middleware.mjs";
import { DashboardController } from "../controllers/dashboard.controller.mjs";

/** App router
 * @param {{
 * userModel: import('../models/sqlite/user.model.mjs').User,
 * taskModel: import('../models/sqlite/tasks.model.mjs').Task,
 * dashboardModel: import('../models/sqlite/dashboard.model.mjs').Dashboard
 * }} param
 */
export const appRouter = ({ userModel, taskModel, dashboardModel }) => {
  const router = Router();

  const authController = new AuthController({ userModel });
  const userController = new UserController({ userModel });
  const taskController = new TaskController({ taskModel });
  const dashboardController = new DashboardController({ dashboardModel });

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
   *        description: Response with new user
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
   *        description: Get session auth
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/User'
   *      404:
   *        description: Not Found.
   *      401:
   *        description: Incorrect password or email.
   *      500:
   *        description: Internal Server Error/
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
   *        description: Successfully
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
   *        description: Get one task
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
  router.get("/task/:id", taskController.getTaskById);
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
   *        description: Get all tasks
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
  router.post("/task", jwtMiddleware, taskController.createTask);
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
  router.patch("/task", jwtMiddleware, taskController.updateTask);
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
   *        description: Bad Request
   *      401:
   *        description: Unauthorized.
   *      404:
   *        description: Not Found.
   *      500:
   *        description: Internal Server Error.
   */
  router.delete("/task", jwtMiddleware, taskController.deleteTask);

  //  Dashboard
  router.get("/dashboard", jwtMiddleware, dashboardController.findAllByEmail);
  router.put(
    "/dashboard",
    jwtMiddleware,
    dashboardController.createNewDashboard
  );
  router.patch(
    "/dashboard",
    jwtMiddleware,
    dashboardController.updateDashboard
  );

  router.get("/verify", userController.verifyEmail);

  return router;
};
