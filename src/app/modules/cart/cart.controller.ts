import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CartServices } from "./cart.service";

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await CartServices.addToCart(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product added to cart successfully",
    data: result,
  });
});
const getCartItems = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await CartServices.getCartItems(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart items fetched successfully",
    data: result,
  });
});

const updateQuantity = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await CartServices.updateQuantity(user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item quantity updated successfully",
    data: result,
  });
});

const deleteCartItem = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await CartServices.deleteCartItem(user, req.params.productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item deleted successfully",
    data: result,
  });
});

export const CartController = {
  addToCart,
  getCartItems,
  updateQuantity,
  deleteCartItem,
};
