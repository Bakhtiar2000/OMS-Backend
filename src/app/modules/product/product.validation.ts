import { z } from "zod";

const createProductValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Product name is required" }),
    description: z.string({ required_error: "Description is required" }),
    price: z.number({ required_error: "Price is required" }),
    stock: z.number({ required_error: "Stock is required" }),
  }),
});

export const ProductValidation = {
  createProductValidationSchema,
};
