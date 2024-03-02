import z from "zod";

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3).max(20),
  username: z.string().optional(),
});

export const emailSchema = z.object({
  email: z.string().email(),
});
