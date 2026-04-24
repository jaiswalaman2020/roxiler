const { z } = require("zod");
const { ROLES } = require("./constants");

const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const emailSchema = z.string().email();

const userNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name is required" })
  .max(60);
const addressSchema = z.string().max(400);
const passwordSchema = z.string().regex(passwordRegex, {
  message:
    "Password must be 8-16 chars and include at least one uppercase letter and one special character",
});

const signupSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

const createUserSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum([ROLES.ADMIN, ROLES.USER, ROLES.OWNER]).default(ROLES.USER),
});

const createStoreSchema = z.object({
  name: z.string().min(1).max(120),
  email: emailSchema,
  address: addressSchema,
  ownerId: z.coerce.number().int().positive().optional(),
});

const ratingSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
});

module.exports = {
  signupSchema,
  loginSchema,
  updatePasswordSchema,
  createUserSchema,
  createStoreSchema,
  ratingSchema,
};
