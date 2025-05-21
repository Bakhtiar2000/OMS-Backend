import { z } from "zod";

const addToCartValidationSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: "Product ID is required",
    }),
  }),
});

const updateQuantityValidationSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: "Product ID is required",
    }),
    quantity: z
      .number({
        required_error: "Quantity is required",
      })
      .min(1, "Quantity must be at least 1"),
  }),
});

export const CartValidation = {
  addToCartValidationSchema,
  updateQuantityValidationSchema,
};
