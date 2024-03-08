// @ts-check
import "dotenv/config";
import swaggerJSDoc from "swagger-jsdoc";

const PORT = process.env.PORT ?? 3000;
const VERSION = process.env.API_VERSION ?? "v1";
const PATH = process.env.URL_PATH ?? "http://localhost";

/** Swagger options
 * @type {Swagger}
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Api Agendapp",
      version: "0.0.1",
      description: "Aplicación de agenda/tarea",
    },
    servers: [
      {
        url: `${PATH}:${PORT}/api/${VERSION}`,
      },
    ],
  },
  apis: ["./routes/*.mjs"],
};

/** Swagger config */
export const specs = swaggerJSDoc(options);

/** @typedef {import('swagger-jsdoc').Options|import('swagger-jsdoc').Callback} Swagger*/
