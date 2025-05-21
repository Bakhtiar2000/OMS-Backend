import express from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { UserValidations } from "./user.validation";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";

const router = express.Router();

router.get("/single/:id", auth(USER_ROLE.admin), UserControllers.getSingleUser);
router.get("/", auth(USER_ROLE.admin), UserControllers.getAllUsers);
router.post(
  "/register",
  validateRequest(UserValidations.createUserValidationSchema),
  UserControllers.createAUser
);
router.get("/me", auth(USER_ROLE.admin, USER_ROLE.user), UserControllers.getMe);

router.patch(
  "/change-status/:id",
  auth(USER_ROLE.admin),
  validateRequest(UserValidations.changeStatusValidationSchema),
  UserControllers.changeStatus
);

export const UserRoutes = router;
