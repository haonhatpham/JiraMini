import { z } from "zod";
export declare const taskPrioritySchema: z.ZodEnum<{
    low: "low";
    medium: "medium";
    high: "high";
    critical: "critical";
}>;
export declare const taskStatusSchema: z.ZodEnum<{
    backlog: "backlog";
    todo: "todo";
    "in-progress": "in-progress";
    done: "done";
}>;
export declare const taskSortFieldSchema: z.ZodEnum<{
    createdAt: "createdAt";
    dueDate: "dueDate";
    position: "position";
    priority: "priority";
    status: "status";
    title: "title";
}>;
export declare const sortOrderSchema: z.ZodEnum<{
    asc: "asc";
    desc: "desc";
}>;
export declare const uuidSchema: z.ZodGUID;
export declare const dateOnlySchema: z.ZodString;
export declare const taskUserResponseSchema: z.ZodObject<{
    id: z.ZodGUID;
    email: z.ZodEmail;
    name: z.ZodString;
    avatarUrl: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const taskResponseSchema: z.ZodObject<{
    id: z.ZodGUID;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    priority: z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        critical: "critical";
    }>;
    status: z.ZodEnum<{
        backlog: "backlog";
        todo: "todo";
        "in-progress": "in-progress";
        done: "done";
    }>;
    position: z.ZodNumber;
    assigneeId: z.ZodNullable<z.ZodGUID>;
    createdBy: z.ZodGUID;
    dueDate: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodISODateTime;
    updatedAt: z.ZodISODateTime;
    assignee: z.ZodNullable<z.ZodObject<{
        id: z.ZodGUID;
        email: z.ZodEmail;
        name: z.ZodString;
        avatarUrl: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    creator: z.ZodObject<{
        id: z.ZodGUID;
        email: z.ZodEmail;
        name: z.ZodString;
        avatarUrl: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const listTasksSchema: z.ZodObject<{
    query: z.ZodObject<{
        status: z.ZodPreprocess<z.ZodOptional<z.ZodEnum<{
            backlog: "backlog";
            todo: "todo";
            "in-progress": "in-progress";
            done: "done";
        }>>>;
        priority: z.ZodPreprocess<z.ZodOptional<z.ZodArray<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            critical: "critical";
        }>>>>;
        assigneeId: z.ZodPreprocess<z.ZodOptional<z.ZodGUID>>;
        createdBy: z.ZodPreprocess<z.ZodOptional<z.ZodGUID>>;
        dueDateFrom: z.ZodPreprocess<z.ZodOptional<z.ZodString>>;
        dueDateTo: z.ZodPreprocess<z.ZodOptional<z.ZodString>>;
        search: z.ZodPreprocess<z.ZodOptional<z.ZodString>>;
        page: z.ZodPreprocess<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
        limit: z.ZodPreprocess<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
        sortBy: z.ZodPreprocess<z.ZodDefault<z.ZodEnum<{
            createdAt: "createdAt";
            dueDate: "dueDate";
            position: "position";
            priority: "priority";
            status: "status";
            title: "title";
        }>>>;
        sortOrder: z.ZodPreprocess<z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getTaskByIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodGUID;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createTaskSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodString>>>;
        priority: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            critical: "critical";
        }>;
        status: z.ZodDefault<z.ZodEnum<{
            backlog: "backlog";
            todo: "todo";
            "in-progress": "in-progress";
            done: "done";
        }>>;
        position: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        assigneeId: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodGUID>>>;
        dueDate: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodString>>>;
    }, z.core.$strict>;
}, z.core.$strip>;
export declare const updateTaskSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodGUID;
    }, z.core.$strip>;
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodPreprocess<z.ZodNullable<z.ZodString>>;
        priority: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            critical: "critical";
        }>;
        status: z.ZodEnum<{
            backlog: "backlog";
            todo: "todo";
            "in-progress": "in-progress";
            done: "done";
        }>;
        position: z.ZodCoercedNumber<unknown>;
        assigneeId: z.ZodPreprocess<z.ZodNullable<z.ZodGUID>>;
        dueDate: z.ZodPreprocess<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
}, z.core.$strip>;
export declare const updateTaskStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodGUID;
    }, z.core.$strip>;
    body: z.ZodObject<{
        status: z.ZodEnum<{
            backlog: "backlog";
            todo: "todo";
            "in-progress": "in-progress";
            done: "done";
        }>;
        position: z.ZodCoercedNumber<unknown>;
    }, z.core.$strict>;
}, z.core.$strip>;
export declare const deleteTaskSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodGUID;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const listTasksResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodGUID;
        title: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        priority: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            critical: "critical";
        }>;
        status: z.ZodEnum<{
            backlog: "backlog";
            todo: "todo";
            "in-progress": "in-progress";
            done: "done";
        }>;
        position: z.ZodNumber;
        assigneeId: z.ZodNullable<z.ZodGUID>;
        createdBy: z.ZodGUID;
        dueDate: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodISODateTime;
        updatedAt: z.ZodISODateTime;
        assignee: z.ZodNullable<z.ZodObject<{
            id: z.ZodGUID;
            email: z.ZodEmail;
            name: z.ZodString;
            avatarUrl: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        creator: z.ZodObject<{
            id: z.ZodGUID;
            email: z.ZodEmail;
            name: z.ZodString;
            avatarUrl: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const taskDetailResponseSchema: z.ZodObject<{
    data: z.ZodObject<{
        id: z.ZodGUID;
        title: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        priority: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
            critical: "critical";
        }>;
        status: z.ZodEnum<{
            backlog: "backlog";
            todo: "todo";
            "in-progress": "in-progress";
            done: "done";
        }>;
        position: z.ZodNumber;
        assigneeId: z.ZodNullable<z.ZodGUID>;
        createdBy: z.ZodGUID;
        dueDate: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodISODateTime;
        updatedAt: z.ZodISODateTime;
        assignee: z.ZodNullable<z.ZodObject<{
            id: z.ZodGUID;
            email: z.ZodEmail;
            name: z.ZodString;
            avatarUrl: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        creator: z.ZodObject<{
            id: z.ZodGUID;
            email: z.ZodEmail;
            name: z.ZodString;
            avatarUrl: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
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
export type UpdateTaskStatusBody = z.infer<typeof updateTaskStatusSchema>["body"];
export type ListTasksResponse = z.infer<typeof listTasksResponseSchema>;
export type TaskDetailResponse = z.infer<typeof taskDetailResponseSchema>;
//# sourceMappingURL=task.schema.d.ts.map