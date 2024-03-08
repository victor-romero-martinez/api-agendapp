import z from "zod";

const ROLE = ["user", "admin"];

export const emailSchema = z.object({
  email: z.string().email(),
});

export const auth = emailSchema.extend({
  password: z.string().min(4).max(255),
});

// Updatable
const userUpdatable = z.object({
  email: z.string().email().optional(),
  password: z.string().min(4).max(255).optional(),
  user_name: z.string().min(4).max(60).optional(),
  url_img: z.string().url().optional(),
  updated_at: z.string().optional(),
});

export const userUpdatableSchema = userUpdatable.extend({
  new_password: z.string().min(4).max(255).optional(),
});

export const userSchema = userUpdatable.extend({
  role: z.enum(ROLE).default("user"),
  token_email: z.string().optional(),
  created_at: z.date(),
});
