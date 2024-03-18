import z from "zod";

export const DashboardSchema = z.object({
  name: z.string().min(1).max(60),
});

export const DashboardUpdateSchema = DashboardSchema.extend({
  id: z.number().positive(),
});
