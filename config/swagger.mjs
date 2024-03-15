// @ts-check
import "dotenv/config";
import swaggerJSDoc from "swagger-jsdoc";

const PORT = process.env.PORT;
const VERSION = process.env.API_VERSION;
const HOST = process.env.URL_BASE;

/** Swagger options
 * @type {Swagger}
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Api Agendapp",
      version: "0.0.1",
      description: "Aplicación de agenda/tareas",
    },
    servers: [
      {
        url: `${HOST}:${PORT}/api/${VERSION}`,
      },
    ],
  },
  apis: ["./routes/*.mjs"],
};

/** Swagger config */
export const specs = swaggerJSDoc(options);

/** @typedef {import('swagger-jsdoc').Options|import('swagger-jsdoc').Callback} Swagger*/
