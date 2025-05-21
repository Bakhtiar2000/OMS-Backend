import { Cart } from "./cart.model";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";

const addToCart = async (user: JwtPayload, payload: { productId: string }) => {
  const cart = await Cart.findOne({ userId: user.userId });

  if (cart) {
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === payload.productId
    );
    if (existingItem) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This Product is already in cart!"
      );
    }
    await Cart.updateOne(
      { userId: user.userId },
      {
        $push: {
          items: {
            productId: payload.productId,
            quantity: 1,
          },
        },
      }
    );
    return await Cart.findOne({ userId: user.userId });
  }

  const newCart = await Cart.create({
    userId: user.userId,
    items: [
      {
        productId: payload.productId,
        quantity: 1,
      },
    ],
  });
  return newCart;
};

const getCartItems = async (user: JwtPayload) => {
  const cart = await Cart.findOne({ userId: user.userId });
  return cart;
};

const updateQuantity = async (
  user: JwtPayload,
  payload: { productId: string; quantity: number }
) => {
  const cart = await Cart.findOne({ userId: user.userId });
  if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");

  const item = cart.items.find(
    (item) => item.productId.toString() === payload.productId
  );
  if (!item)
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found in cart");

  await Cart.updateOne(
    { userId: user.userId, "items.productId": payload.productId },
    {
      $set: { "items.$.quantity": payload.quantity },
    }
  );
  return await Cart.findOne({ userId: user.userId });
};

const deleteCartItem = async (user: JwtPayload, productId: string) => {
  const cart = await Cart.findOne({ userId: user.userId });
  if (!cart) throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");

  await Cart.updateOne(
    { userId: user.userId },
    {
      $pull: {
        items: { productId },
      },
    }
  );
  return await Cart.findOne({ userId: user.userId });
};

export const CartServices = {
  addToCart,
  updateQuantity,
  deleteCartItem,
  getCartItems,
};
