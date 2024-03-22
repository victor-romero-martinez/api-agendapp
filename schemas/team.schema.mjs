import z from "zod";

const base = z.object({
  members: z.array(z.number().positive()).nonempty(),
});

export const teamSchema = base.extend({
  organization: z.string().min(3).max(60),
});

export const teamEditable = base.extend({
  id: z.number().positive(),
  action: z.enum(["add", "remove"]),
});
