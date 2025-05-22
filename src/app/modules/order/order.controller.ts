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

const getMyOrders = catchAsync(async (req, res) => {
  const result = await OrderServices.getMyOrders(req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders fetched successfully",
    data: result,
  });
});

const getAllOrders = catchAsync(async (req, res) => {
  const result = await OrderServices.getAllOrders(req.query);
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
  getMyOrders,
  getAllOrders,
};
