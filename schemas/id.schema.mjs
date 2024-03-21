import z from "zod";

export const idSchema = z.object({
  id: z.number().positive(),
});
