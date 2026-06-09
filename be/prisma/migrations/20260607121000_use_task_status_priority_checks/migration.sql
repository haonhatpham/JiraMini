ALTER TABLE "tasks" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "tasks" ALTER COLUMN "priority" TYPE VARCHAR(20) USING "priority"::text;
ALTER TABLE "tasks" ALTER COLUMN "status" TYPE VARCHAR(20) USING "status"::text;

ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'backlog';

ALTER TABLE "tasks"
  ADD CONSTRAINT "tasks_priority_check"
  CHECK ("priority" IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE "tasks"
  ADD CONSTRAINT "tasks_status_check"
  CHECK ("status" IN ('backlog', 'todo', 'in-progress', 'done'));

DROP TYPE "TaskPriority";
DROP TYPE "TaskStatus";
