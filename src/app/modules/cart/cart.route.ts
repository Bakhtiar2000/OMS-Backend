import express from "express";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { CartController } from "./cart.controller";
import { CartValidation } from "./cart.validation";
import { validateRequest } from "../../middleWear/validateRequest";

const router = express.Router();

router.post(
  "/add-to-cart",
  auth(USER_ROLE.user),
  validateRequest(CartValidation.addToCartValidationSchema),
  CartController.addToCart
);

router.get("/", auth(USER_ROLE.user), CartController.getCartItems);

router.patch(
  "/update-quantity",
  auth(USER_ROLE.user),
  validateRequest(CartValidation.updateQuantityValidationSchema),
  CartController.updateQuantity
);

router.delete(
  "/item/:productId",
  auth(USER_ROLE.user),
  CartController.deleteCartItem
);

export const CartRoutes = router;
