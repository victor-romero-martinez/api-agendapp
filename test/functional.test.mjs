import { expect, test, expectTypeOf } from "vitest";
import { passwordTest, comparePassword } from "../utils/cipher.spec.mjs";
import { generateTokenTest, verifyTokenTest } from "../utils/jwtToken.spec.mjs";

// test password
test("Should be generate a hash string", () => {
  expect(passwordTest("my-password")).toBe("32c9bab5a57b4a4a690f253c2c07185b");
});

test("Should be return true is equal arguments", () => {
  expect(
    comparePassword("my-password", "32c9bab5a57b4a4a690f253c2c07185b")
  ).toBe(Boolean(true));
});

// test token
test("Should generate a string", () => {
  const token = generateTokenTest({ user_name: "John Dae" }, "1d");
  expectTypeOf(token).toBeString();
});

test("Should be verify the token", () => {
  const res = verifyTokenTest(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzA5NzU4MTIwLCJleHAiOjE3MDk4NDQ1MjB9.OJdgZv_CxdUQJvlm2vg_FIWuf309GvmzXNLWUNQrgU8"
  );

  expect(res).toMatchObject({ username: "John Doe" });
});
