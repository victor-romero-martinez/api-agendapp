// @ts-check
import "dotenv/config";
import { expectTypeOf, test } from "vitest";
import { JwtToken } from "./jwtToken.mjs";
import { expect } from "vitest";

const JWT_SECRET = process.env.JWT;

if (!JWT_SECRET) {
  throw new Error("JWT secret is missing");
}

const jwt = new JwtToken(JWT_SECRET);

// test token
test("Should generate a string", () => {
  const token = jwt.sign({ user_name: "John Dae" }, "1d");

  expectTypeOf(token).toBeString();
});

test("Should be verify the token", () => {
  const res = jwt.verify(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkpvaG4gRGFlIiwiaWF0IjoxNzExMTEyODk1LCJleHAiOjE3MTExOTkyOTV9.tyDdp9LMsVAQq2aQQG8e7iFMpY7k61G-YEQr6_-AAQw"
  );

  expect(res).toHaveProperty("username");
});
