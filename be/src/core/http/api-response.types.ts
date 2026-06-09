export type ApiResponse<T> = {
  data: T;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ErrorDetail = {
  field: string;
  message: string;
};

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
};
