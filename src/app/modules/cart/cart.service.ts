import { Cart } from "./cart.model";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Product } from "../product/product.model";

type TCartProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
};

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
  const cart = await Cart.findOne({ userId: user.userId }).populate<{
    items: { productId: TCartProduct; quantity: number }[];
  }>({
    path: "items.productId",
    select: "price",
  });

  if (!cart) return { cart: null, totalAmount: "0.00" };

  const totalAmount = cart.items.reduce((acc, item) => {
    const price = item.productId.price || 0;
    return acc + price * item.quantity;
  }, 0);

  return {
    cart,
    totalAmount: totalAmount.toFixed(2),
  };
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
  const stock = (item.productId as any).stock;

  if (payload.quantity > stock) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Only ${stock} item(s) in stock for this product`
    );
  }

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
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

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
