import { Schema, model } from "mongoose";
import { TAddress, TOrder, TOrderItem } from "./order.interface";

const OrderItemSchema = new Schema<TOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const AddressSchema = new Schema<TAddress>(
  {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      enum: ["Dhaka", "Chittagong"],
      required: true,
    },
    postalCode: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<TOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    number: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "packaging",
        "ready_to_ship",
        "on_the_way",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "cod", "refunded"],
      required: true,
    },
    shippingAddress: {
      type: AddressSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = model<TOrder>("Order", OrderSchema);
