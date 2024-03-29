import "dotenv/config";
import formData from "form-data";
import mailgun from "mailgun.js";

const VERSION = process.env.API_VERSION;
const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;
const FROM = process.env.EMAIL_FROM;
const DESTINATION_DEV = process.env.EMAIL_DEV_TEST; // restriction for free account on mailgun

const clint = new mailgun(formData);

const mg = clint.client({
  username: "api",
  key: API_KEY,
});

/**
 * Send Email
 * @param {string} url
 * @param {string} email
 * @param {string} token
 */
export function sendMail(url, email, token) {
  mg.messages
    .create(DOMAIN, {
      from: FROM,
      to: [DESTINATION_DEV],
      subject: "Confirm your account!",
      text: "Testing some Mailgun awesomeness!. ",
      html: `<main style="height: 100vh;display: flex;font-family: &quot;system-ui&quot;, sans-serif;flex-direction: column;align-items: center;justify-content: center;">
      <h1>Testing some Mailgun awesomeness!</h1>
  <p>Para confirmar su correo ${email} haga <a href='${url}/api/${VERSION}/verify?token=${token}' rel='noopener noreferrer'>click aquí</a></p>
  </main>`,
    })
    .then((msg) => console.log(msg)) // logs response data
    .catch((err) => console.log(err)); // logs any error
}
