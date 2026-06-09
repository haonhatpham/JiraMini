export const routes = {
  auth: {
    login: '/auth/login',
    register: '/auth/register'
  },
  users: {
    list: '/users'
  },
  tasks: {
    list: '/tasks',
    detail: (id: string) => `/tasks/${id}`,
    status: (id: string) => `/tasks/${id}/status`
  }
} as const
