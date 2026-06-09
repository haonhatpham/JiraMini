import type { MutableRefObject } from 'react'
import type { TaskStatus } from '@jiramini/shared/task'
import { taskService } from '@/features/tasks/task.service'
import type { Task } from '@/features/tasks/types'
import type { BoardColumnRefreshRequest } from '../types'
import { mapApiTask, moveTaskToPosition, normalizeTaskPositions } from './boardTasks'

type BoardTaskMoveRefs = {
  latestMoveByTaskRef: MutableRefObject<Map<string, number>>
  moveRollbackByTaskRef: MutableRefObject<Map<string, Task>>
  moveQueueRef: MutableRefObject<Promise<void>>
  moveSequenceRef: MutableRefObject<number>
}

type PersistBoardTaskMoveOptions = BoardTaskMoveRefs & {
  taskId: string
  nextTasks: Task[]
  rollbackTasks: Task[]
  columnRefreshRequests?: BoardColumnRefreshRequest[]
  tasksRef: MutableRefObject<Task[]>
  setBoardTasks: (tasks: Task[]) => void
  onMoveColumnTaskCount: (fromColumnId: TaskStatus, toColumnId: TaskStatus) => void
  onRefreshColumns: (requests: BoardColumnRefreshRequest[]) => Promise<void>
  onError: (error: unknown) => void
}

export async function persistBoardTaskMove({
  taskId,
  nextTasks,
  rollbackTasks,
  columnRefreshRequests = [],
  tasksRef,
  setBoardTasks,
  onMoveColumnTaskCount,
  onRefreshColumns,
  onError,
  latestMoveByTaskRef,
  moveRollbackByTaskRef,
  moveQueueRef,
  moveSequenceRef
}: PersistBoardTaskMoveOptions) {
  const normalizedTasks = normalizeTaskPositions(nextTasks)
  const movedTask = normalizedTasks.find((task) => task.id === taskId)
  const rollbackTask = rollbackTasks.find((task) => task.id === taskId)

  if (!movedTask) {
    setBoardTasks(rollbackTasks)
    return
  }

  setBoardTasks(normalizedTasks)

  if (rollbackTask && rollbackTask.columnId === movedTask.columnId && rollbackTask.position === movedTask.position) {
    return
  }

  const moveId = moveSequenceRef.current + 1
  moveSequenceRef.current = moveId
  latestMoveByTaskRef.current.set(movedTask.id, moveId)

  if (rollbackTask && !moveRollbackByTaskRef.current.has(movedTask.id)) {
    moveRollbackByTaskRef.current.set(movedTask.id, rollbackTask)
  }

  const isLatestMoveForTask = () => latestMoveByTaskRef.current.get(movedTask.id) === moveId

  moveQueueRef.current = moveQueueRef.current.then(async () => {
    try {
      const updatedTask = await taskService.updateTaskStatus(movedTask.id, {
        status: movedTask.columnId,
        position: movedTask.position
      })

      const syncedTask = mapApiTask(updatedTask)
      moveRollbackByTaskRef.current.set(movedTask.id, syncedTask)

      if (!isLatestMoveForTask()) {
        return
      }

      const tasksWithSyncedMeta = tasksRef.current.map((task) =>
        task.id === syncedTask.id ? { ...task, updatedAt: syncedTask.updatedAt } : task
      )

      latestMoveByTaskRef.current.delete(movedTask.id)
      moveRollbackByTaskRef.current.delete(movedTask.id)
      setBoardTasks(moveTaskToPosition(tasksWithSyncedMeta, syncedTask.id, syncedTask.columnId, syncedTask.position))

      if (columnRefreshRequests.length > 0) {
        await onRefreshColumns(columnRefreshRequests)
      }
    } catch (error) {
      if (!isLatestMoveForTask()) {
        return
      }

      const rollbackTarget = moveRollbackByTaskRef.current.get(movedTask.id) ?? rollbackTask

      latestMoveByTaskRef.current.delete(movedTask.id)
      moveRollbackByTaskRef.current.delete(movedTask.id)

      if (rollbackTarget) {
        if (movedTask.columnId !== rollbackTarget.columnId) {
          onMoveColumnTaskCount(movedTask.columnId, rollbackTarget.columnId)
        }

        setBoardTasks(
          moveTaskToPosition(tasksRef.current, movedTask.id, rollbackTarget.columnId, rollbackTarget.position)
        )
      } else {
        setBoardTasks(rollbackTasks)
      }

      onError(error)
    }
  })

  try {
    await moveQueueRef.current
  } catch {
    // Errors are handled inside the queued move to keep later drag requests running.
  }
}
