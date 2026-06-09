const MAX_BOARD_COLUMN_FETCH_LIMIT = 100

// Keeps column refresh requests inside the API limit range.
export function getColumnFetchLimit(visibleCount: number): number {
  return Math.min(Math.max(Math.ceil(visibleCount), 1), MAX_BOARD_COLUMN_FETCH_LIMIT)
}
