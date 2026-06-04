// src/features/tasks/schemas/task.schema.ts
import { z } from 'zod'
import { taskPrioritySchema, taskStatusSchema } from '@jiramini/shared/task'

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(80, 'Title must be less than 80 characters.'),

  description: z
    .string()
    .trim()
    .min(1, 'Description is required.')
    .max(500, 'Description must be less than 500 characters.'),

  priority: taskPrioritySchema,

  assignee: z.string().trim().min(1, 'Assignee is required.'),

  dueDate: z.string().min(1, 'Due date is required.'),

  columnId: taskStatusSchema
})

export type TaskFormData = z.infer<typeof taskFormSchema>
