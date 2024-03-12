import z from "zod";

const status = ["pending", "inprogress", "completed"];

export const taskSchema = z.object({
  title: z.string().min(4).max(60),
  description: z.string().min(4).max(250).optional(),
  status: z.enum(status).optional(),
  priority: z.number().min(1).max(5).optional(),
  updated_at: z.string().optional(),
  due_date: z.string().optional(),
});
