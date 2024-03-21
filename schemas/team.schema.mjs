import z from "zod";

export const teamSchema = z.object({
  add: z.array(z.number().positive()).nonempty().optional(),
  remove: z.number().positive().optional(),
});

export const teamEditable = teamSchema.extend({
  id: z.number().positive(),
});
