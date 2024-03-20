import z from "zod";

export const teamSchema = z.object({
  members: z.array(z.number()).optional(),
});
