import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Order } from "./order.model";
import { Cart } from "../cart/cart.model";
import ApiError from "../../errors/ApiError";

const createOrder = async (user: JwtPayload, body: any) => {
  const cart = await Cart.findOne({ userId: user.userId }).populate({
    path: "items.productId",
    select: "price",
  });
  if (!cart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cart not found");
  }
  const cartItems = cart.items;
  if (!cartItems.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cart is empty");
  }

  const items = cartItems.map((item) => ({
    productId: item.productId._id,
    quantity: item.quantity,
    price: (item.productId as any).price * item.quantity,
  }));

  const totalAmount = items.reduce((acc, item) => acc + item.price, 0);

  const order = await Order.create({
    userId: user.userId,
    number: body.number,
    note: body.note,
    items,
    totalAmount: totalAmount.toFixed(2),
    paymentStatus: body.paymentStatus,
    isAccepted: true,
    shippingAddress: body.shippingAddress,
  });
  await Cart.deleteOne({ userId: user.userId });
  return order;
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
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  return order;
};

const cancelOrder = async (id: string, userId: string) => {
  const order = await Order.findOneAndUpdate(
    { _id: id, userId },
    { status: "cancelled" },
    { new: true }
  );
  if (!order)
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found or unauthorized");
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
  getMyOrders,
  getAllOrders,
};
