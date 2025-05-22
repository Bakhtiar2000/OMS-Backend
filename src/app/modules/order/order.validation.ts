import { z } from "zod";

const createOrderValidationSchema = z.object({
  body: z.object({
    number: z.string({ required_error: "Phone number is required" }),
    totalAmount: z.number({ required_error: "Total amount is required" }),
    note: z.string().optional(),
    paymentStatus: z.enum(["paid", "cod"], {
      required_error: "Payment status is required",
    }),
    shippingAddress: z.object({
      street: z.string({ required_error: "Address is required" }),
      city: z.enum(["Dhaka", "Chittagong"], {
        required_error: "City is required",
      }),
      postalCode: z.number({ required_error: "Postal code is required" }),
    }),
  }),
});

const updateStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["packaging", "ready_to_ship", "on_the_way"]),
  }),
});

export const OrderValidation = {
  createOrderValidationSchema,
  updateStatusValidationSchema,
};
