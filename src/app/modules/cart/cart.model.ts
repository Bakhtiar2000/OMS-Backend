import { Schema, model, Types } from "mongoose";
import { TCart, TCartItem } from "./cart.interface";

const cartItemSchema = new Schema<TCartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    equired: true,
    min: 1,
  },
});

const cartSchema = new Schema<TCart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Cart = model<TCart>("Cart", cartSchema);
