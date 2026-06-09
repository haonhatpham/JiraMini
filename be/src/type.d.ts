declare namespace Express {
  interface Request {
    user: {
      id: string;
    };
    validated?: {
      body?: unknown;
      params?: unknown;
      query?: unknown;
    };
  }
}
