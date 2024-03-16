import nodemailer from "nodemailer";
import "dotenv/config";

const PROVIDER = process.env.NODEMAILER_PROVIDER;
const PORT = process.env.NODEMAILER_PORT;
const USER = process.env.NODEMAILER_USER;
const PASS = process.env.NODEMAILER_PASS;
const HOST = process.env.URL_BASE;
const VERSION = process.env.API_VERSION;

if (!PROVIDER || !PORT || !USER || !PASS || !HOST) {
  throw Error("💀 Missing some .env on nodemailer file.");
}

/** Nodemailer Transporter */
export const transporter = nodemailer.createTransport({
  host: PROVIDER,
  port: PORT,
  secure: true,
  auth: {
    user: USER,
    pass: PASS,
  },
});

/** Email template
 * @param {string} to
 * @param {string} token
 */
export const mailTemplate = (to, token) => {
  const email = {
    from: USER,
    to,
    subject: "Confirm your email.",
    text: `Click to the link: ${path}/verify?token=${token}`,
    html: `
      <h1>Require action</h1>
      <p>Click to the link <a href="${HOST}/api/${API_VERSION}/verify?token=${token}" target="_blank" rel="noopener noreferrer">Click me</a></p>
    `,
  };

  return email;
};
