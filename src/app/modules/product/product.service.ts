import { Product } from "./product.model";
import { TProduct } from "./product.interface";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createProduct = async (
  file: Express.Multer.File | undefined,
  payload: TProduct
) => {
  if (file) {
    const uploaded = (await sendImageToCloudinary(
      file.filename,
      file.path
    )) as { secure_url: string };
    payload.imageUrl = uploaded.secure_url;
  } else throw new ApiError(httpStatus.BAD_REQUEST, "Image is Required");

  const product = await Product.create(payload);
  return product;
};

const getAllProducts = async () => {
  const products = await Product.find();
  return products;
};
const getSingleProduct = async (id: string) => {
  const products = await Product.findById(id);
  return products;
};

export const ProductServices = {
  createProduct,
  getAllProducts,
  getSingleProduct,
};
