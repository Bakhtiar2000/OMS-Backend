import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { OrderServices } from "./order.service";

const createOrder = catchAsync(async (req, res) => {
  const result = await OrderServices.createOrder(req.user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const result = await OrderServices.updateStatus(
    req.params.id,
    req.body.status
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated",
    data: result,
  });
});

const refundPayment = catchAsync(async (req, res) => {
  const result = await OrderServices.refundPayment(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment refunded",
    data: result,
  });
});

const cancelOrder = catchAsync(async (req, res) => {
  const result = await OrderServices.cancelOrder(
    req.params.id,
    req.user.userId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order cancelled",
    data: result,
  });
});

const getMyOrders = catchAsync(async (req, res) => {
  const result = await OrderServices.getMyOrders(req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders fetched successfully",
    data: result,
  });
});

const getAllOrders = catchAsync(async (_req, res) => {
  const result = await OrderServices.getAllOrders();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All orders fetched",
    data: result,
  });
});

export const OrderControllers = {
  createOrder,
  updateStatus,
  refundPayment,
  cancelOrder,
  getMyOrders,
  getAllOrders,
};
