// src/features/board/constants.ts
import type { BoardColumn } from './types'

export const BOARD_COLUMN_PAGE_SIZE = 4

export const BOARD_COLUMNS: BoardColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog'
  },
  {
    id: 'todo',
    title: 'Todo'
  },
  {
    id: 'in-progress',
    title: 'In Progress'
  },
  {
    id: 'done',
    title: 'Done'
  }
]
