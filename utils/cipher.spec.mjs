import "dotenv/config";
import { expect, test } from "vitest";
import { Cipher } from "./cipher.mjs";

const SECRET = process.env.SECRET;

if (!SECRET) {
  throw Error("Missing secret.");
}

const c = new Cipher(SECRET);

test("Should be generate a hash string", () => {
  expect(c.generate("my-password")).toBe("32c9bab5a57b4a4a690f253c2c07185b");
});

test("Should be return true is equal arguments", () => {
  expect(c.compare("my-password", "32c9bab5a57b4a4a690f253c2c07185b")).toBe(
    Boolean(true)
  );
});
