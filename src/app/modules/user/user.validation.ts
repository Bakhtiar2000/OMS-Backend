import { z } from "zod";

const createUserValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().max(20),
    name: z.string(),
  }),
});

const changeStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["in-progress", "blocked"]),
  }),
});

export const UserValidations = {
  createUserValidationSchema,
  changeStatusValidationSchema,
};
