import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Order } from "./order.model";
import { Cart } from "../cart/cart.model";
import ApiError from "../../errors/ApiError";
import mongoose from "mongoose";
import { Product } from "../product/product.model";
import { TOrderItem } from "./order.interface";

const restockProducts = async (orderItems: TOrderItem[]) => {
  const updatePromises = orderItems.map((item) =>
    Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity },
    })
  );
  await Promise.all(updatePromises);
};

const createOrder = async (user: JwtPayload, payload: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ userId: user.userId })
      .populate({
        path: "items.productId",
        select: "price stock name",
      })
      .session(session);

    if (!cart) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Cart not found");
    }

    const cartItems = cart.items;
    if (!cartItems.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Cart is empty");
    }

    const items = cartItems.map((item) => {
      const product = item.productId as any;
      console.log(product);
      if (product.stock < item.quantity) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Not enough stock for product: ${product.name}`
        );
      }
      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.price * item.quantity,
      };
    });

    // Transaction-1: Create the order
    const order = await Order.create(
      [
        {
          userId: user.userId,
          number: payload.number,
          note: payload.note || "",
          items,
          totalAmount: payload.totalAmount,
          paymentStatus: payload.paymentStatus,
          isAccepted: true,
          shippingAddress: payload.shippingAddress,
        },
      ],
      { session }
    );

    // Transaction-2: Decrease stock of products
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // Transaction-3: Clear the cart
    await Cart.deleteOne({ userId: user.userId }, { session });

    await session.commitTransaction();
    session.endSession();
    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const updateStatus = async (id: string, status: string) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found!");
  }
  const statusFlow = [
    "pending",
    "packaging",
    "ready_to_ship",
    "on_the_way",
    "delivered",
    "cancelled",
  ];
  const currentStatusIndex = statusFlow.indexOf(order.status);
  const newStatusIndex = statusFlow.indexOf(status);

  if (newStatusIndex < currentStatusIndex) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot update status backwards from "${order.status}" to "${status}".`
    );
  }
  const result = await Order.findByIdAndUpdate(id, { status }, { new: true });
  return result;
};

const refundPayment = async (id: string) => {
  const order = await Order.findByIdAndUpdate(
    id,
    { paymentStatus: "refunded" },
    { new: true }
  );
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found!");
  await restockProducts(order.items);
  return order;
};

const cancelOrder = async (id: string, userId: string) => {
  const order = await Order.findOneAndUpdate(
    { _id: id, userId },
    { status: "cancelled" },
    { new: true }
  );
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found!");
  return order;
};

const deliverOrder = async (id: string, userId: string) => {
  const order = await Order.findOneAndUpdate(
    { _id: id, userId },
    { status: "cancelled" },
    { new: true }
  );
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found!");
  await restockProducts(order.items);
  return order;
};

const getMyOrders = async (userId: string) => {
  return await Order.find({ userId });
};

const getAllOrders = async () => {
  return await Order.find();
};

export const OrderServices = {
  createOrder,
  updateStatus,
  refundPayment,
  cancelOrder,
  deliverOrder,
  getMyOrders,
  getAllOrders,
};
