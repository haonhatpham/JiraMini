// src/features/tasks/schemas/task.schema.ts
import { z } from 'zod'
import { taskPrioritySchema, taskStatusSchema } from '@jiramini/shared/task'

const assigneeIdSchema = z
  .string()
  .trim()
  .min(1, 'Assignee is required.')
  .refine((value) => z.guid().safeParse(value).success, {
    message: 'Assignee must be a valid user.'
  })

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200, 'Title must be less than 200 characters.'),

  description: z.string().trim().max(500, 'Description must be less than 500 characters.'),

  priority: taskPrioritySchema,

  assigneeId: assigneeIdSchema,

  dueDate: z.string(),

  columnId: taskStatusSchema
})

export type TaskFormData = z.infer<typeof taskFormSchema>
