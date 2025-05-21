import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductServices } from "./product.service";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import ApiError from "../../errors/ApiError";

const createProduct = catchAsync(async (req, res) => {
  const result = await ProductServices.createProduct(req.file, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const result = await ProductServices.getAllProducts();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Products retrieved successfully",
    data: result,
  });
});

const getSingleProduct = catchAsync(async (req, res) => {
  const result = await ProductServices.getSingleProduct(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

export const ProductControllers = {
  createProduct,
  getAllProducts,
  getSingleProduct,
};
