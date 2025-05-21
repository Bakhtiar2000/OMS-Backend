import express, { NextFunction, Request, Response } from "express";
import { ProductControllers } from "./product.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { ProductValidation } from "./product.validation";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { upload } from "../../utils/sendImageToCloudinary";

const router = express.Router();

router.post(
  "/add-a-product",
  auth(USER_ROLE.admin),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(ProductValidation.createProductValidationSchema),
  ProductControllers.createProduct
);

router.get("/", ProductControllers.getAllProducts);
router.get("/:id", ProductControllers.getSingleProduct);

export const ProductRoutes = router;
