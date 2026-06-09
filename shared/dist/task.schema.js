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
export const uuidSchema = z.guid();
export const dateOnlySchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date format YYYY-MM-DD");
const emptyStringToUndefined = (value) => value === "" ? undefined : value;
const toQueryArray = (value) => {
    if (value === "" || value === undefined) {
        return undefined;
    }
    const values = Array.isArray(value) ? value : [value];
    const normalizedValues = values.flatMap((item) => typeof item === "string" ? item.split(",") : item);
    const filteredValues = normalizedValues.filter((item) => item !== "");
    return filteredValues.length > 0 ? filteredValues : undefined;
};
const nullableTextValueSchema = z.preprocess((value) => (value === "" ? null : value), z.string().trim().max(10_000).nullable());
const nullableTextSchema = nullableTextValueSchema.optional();
const nullableUuidValueSchema = z.preprocess((value) => (value === "" ? null : value), uuidSchema.nullable());
const nullableUuidSchema = nullableUuidValueSchema.optional();
const nullableDateOnlyValueSchema = z.preprocess((value) => (value === "" ? null : value), dateOnlySchema.nullable());
const nullableDateOnlySchema = nullableDateOnlyValueSchema.optional();
export const taskUserResponseSchema = z.object({
    id: uuidSchema,
    email: z.email(),
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
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    assignee: taskUserResponseSchema.nullable(),
    creator: taskUserResponseSchema,
});
export const listTasksSchema = z.object({
    query: z
        .object({
        status: z.preprocess(emptyStringToUndefined, taskStatusSchema.optional()),
        priority: z.preprocess(toQueryArray, z.array(taskPrioritySchema).optional()),
        assigneeId: z.preprocess(emptyStringToUndefined, uuidSchema.optional()),
        createdBy: z.preprocess(emptyStringToUndefined, uuidSchema.optional()),
        dueDateFrom: z.preprocess(emptyStringToUndefined, dateOnlySchema.optional()),
        dueDateTo: z.preprocess(emptyStringToUndefined, dateOnlySchema.optional()),
        search: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(100).optional()),
        page: z.preprocess(emptyStringToUndefined, z.coerce.number().int().positive().default(1)),
        limit: z.preprocess(emptyStringToUndefined, z.coerce.number().int().positive().max(100).default(20)),
        sortBy: z.preprocess(emptyStringToUndefined, taskSortFieldSchema.default("position")),
        sortOrder: z.preprocess(emptyStringToUndefined, sortOrderSchema.default("asc")),
    })
        .superRefine((query, ctx) => {
        if (query.dueDateFrom &&
            query.dueDateTo &&
            query.dueDateFrom > query.dueDateTo) {
            ctx.addIssue({
                code: "custom",
                path: ["dueDateTo"],
                message: "Due date end must be after start",
            });
        }
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
        dueDate: nullableDateOnlySchema,
    })
        .strict(),
});
const updateTaskBodySchema = z
    .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: nullableTextValueSchema,
    priority: taskPrioritySchema,
    status: taskStatusSchema,
    position: z.coerce.number().int().min(0),
    assigneeId: nullableUuidValueSchema,
    dueDate: nullableDateOnlyValueSchema,
})
    .strict();
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
//# sourceMappingURL=task.schema.js.map