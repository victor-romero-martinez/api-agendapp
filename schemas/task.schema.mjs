import z from "zod";

const dashboard = z.object({
  dashboard_id: z.number(),
});

const task = z.object({
  title: z.string().min(4).max(60),
  description: z.string().min(4).max(250).optional(),
  priority: z.number().min(1).max(5).optional(),
  due_date: z.string().optional(),
  assigned_to: z.number().positive().optional(),
});

export const taskSchema = task.merge(dashboard);

export const taskEditable = taskSchema
  .partial()
  .extend({
    id: z.number(),
    color: z.string().max(60).optional(),
  })
  .merge(dashboard);
