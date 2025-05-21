import express from "express";
import { OrderControllers } from "./order.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { OrderValidation } from "./order.validation";

const router = express.Router();

router.post(
  "/create-order",
  auth(USER_ROLE.user),
  validateRequest(OrderValidation.createOrderValidationSchema),
  OrderControllers.createOrder
);

router.patch(
  "/update-status/:id",
  auth(USER_ROLE.admin),
  validateRequest(OrderValidation.updateStatusValidationSchema),
  OrderControllers.updateStatus
);

router.patch(
  "/refund/:id",
  auth(USER_ROLE.user),
  OrderControllers.refundPayment
);

router.patch("/cancel/:id", auth(USER_ROLE.user), OrderControllers.cancelOrder);

router.get("/my-orders", auth(USER_ROLE.user), OrderControllers.getMyOrders);

router.get("/", auth(USER_ROLE.admin), OrderControllers.getAllOrders);

export const OrderRoutes = router;
