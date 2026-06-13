import type { TaskUserResponse } from '@jiramini/shared/task';

// Bảng tóm tắt user dùng cho danh sách assignee — cùng shape với
// assignee/creator trong task response, nên tái dùng type từ @jiramini/shared.
export type UserResponse = TaskUserResponse;

export function mapUser(user: { id: string; email: string; name: string; avatarUrl: string | null }): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl
  };
}
