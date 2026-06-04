import { z } from "zod";

export const taskPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export const taskStatusSchema = z.enum([
  "backlog",
  "todo",
  "in-progress",
  "done",
]);
export const taskSortFieldSchema = z.enum([
  "createdAt",
  "dueDate",
  "position",
  "priority",
  "status",
  "title",
]);
export const sortOrderSchema = z.enum(["asc", "desc"]);

export const uuidSchema = z.string().uuid();
export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date format YYYY-MM-DD");

const nullableTextSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().max(10_000).nullable().optional(),
);

const nullableUuidSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  uuidSchema.nullable().optional(),
);

const nullableDateOnlySchema = z.preprocess(
  (value) => (value === "" ? null : value),
  dateOnlySchema.nullable().optional(),
);

export const taskUserResponseSchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

export const taskResponseSchema = z.object({
  id: uuidSchema,
  title: z.string(),
  description: z.string().nullable(),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  position: z.number().int().min(0),
  assigneeId: uuidSchema.nullable(),
  createdBy: uuidSchema,
  dueDate: dateOnlySchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  assignee: taskUserResponseSchema.nullable(),
  creator: taskUserResponseSchema,
});

export const listTasksSchema = z.object({
  query: z.object({
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    assigneeId: uuidSchema.optional(),
    createdBy: uuidSchema.optional(),
    search: z.string().trim().min(1).max(100).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: taskSortFieldSchema.default("position"),
    sortOrder: sortOrderSchema.default("asc"),
  }),
});

export const getTaskByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const createTaskSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1, "Title is required").max(200),
      description: nullableTextSchema,
      priority: taskPrioritySchema,
      status: taskStatusSchema.default("backlog"),
      position: z.coerce.number().int().min(0).default(0),
      assigneeId: nullableUuidSchema,
      createdBy: uuidSchema,
      dueDate: nullableDateOnlySchema,
    })
    .strict(),
});

const updateTaskBodySchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200).optional(),
    description: nullableTextSchema,
    priority: taskPrioritySchema.optional(),
    status: taskStatusSchema.optional(),
    position: z.coerce.number().int().min(0).optional(),
    assigneeId: nullableUuidSchema,
    dueDate: nullableDateOnlySchema,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const updateTaskSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: updateTaskBodySchema,
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z
    .object({
      status: taskStatusSchema,
      position: z.coerce.number().int().min(0),
    })
    .strict(),
});

export const deleteTaskSchema = getTaskByIdSchema;

export const listTasksResponseSchema = z.object({
  data: z.array(taskResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export const taskDetailResponseSchema = z.object({
  data: taskResponseSchema,
});

export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskSortField = z.infer<typeof taskSortFieldSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
export type TaskUserResponse = z.infer<typeof taskUserResponseSchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type ListTasksQuery = z.infer<typeof listTasksSchema>["query"];
export type TaskIdParams = z.infer<typeof getTaskByIdSchema>["params"];
export type CreateTaskBody = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskBody = z.infer<typeof updateTaskSchema>["body"];
export type UpdateTaskStatusBody = z.infer<
  typeof updateTaskStatusSchema
>["body"];
export type ListTasksResponse = z.infer<typeof listTasksResponseSchema>;
export type TaskDetailResponse = z.infer<typeof taskDetailResponseSchema>;
