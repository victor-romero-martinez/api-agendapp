import z from "zod";

export const taskSchema = z.object({
  title: z.string().min(4).max(60),
  description: z.string().min(4).max(250).optional(),
  priority: z.number().min(1).max(5).optional(),
  dashboard_id: z.number(),
  due_date: z.string().optional(),
});

export const taskEditable = taskSchema.extend({
  id: z.number(),
  color: z.string().max(60),
});
