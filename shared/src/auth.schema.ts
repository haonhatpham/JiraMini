import { z } from "zod";

const nullableAvatarUrlSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.url().trim().max(500).nullable().optional(),
);

export const registerBodySchema = z
  .object({
    email: z.email().trim().max(255),
    password: z.string().min(8).max(72),
    name: z.string().trim().min(1).max(100),
    avatarUrl: nullableAvatarUrlSchema,
  })
  .strict();

export const loginBodySchema = z
  .object({
    email: z.email().trim().max(255),
    password: z.string().min(1).max(72),
  })
  .strict();

export const registerSchema = z.object({
  body: registerBodySchema,
});

export const loginSchema = z.object({
  body: loginBodySchema,
});

export const authUserResponseSchema = z.object({
  id: z.guid(),
  email: z.email(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  createdAt: z.iso.datetime(),
});

export const authResponseSchema = z.object({
  user: authUserResponseSchema,
  accessToken: z.string().min(1),
});

export const authDetailResponseSchema = z.object({
  data: authResponseSchema,
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type AuthUserDto = z.infer<typeof authUserResponseSchema>;
export type AuthResponseDto = z.infer<typeof authResponseSchema>;
export type AuthDetailResponse = z.infer<typeof authDetailResponseSchema>;
