// src/features/board/constants.ts
import type { BoardColumn } from './types'

export const BOARD_COLUMNS: BoardColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    count: 0
  },
  {
    id: 'todo',
    title: 'Todo',
    count: 0
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    count: 0
  },
  {
    id: 'done',
    title: 'Done',
    count: 0
  }
]
