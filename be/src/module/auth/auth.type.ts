export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string | null;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUserDto = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type AuthResponseDto = {
  user: AuthUserDto;
  accessToken: string;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
};
