import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { TUserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import ApiError from "../errors/ApiError";
import { verifyToken } from "../modules/auth/auth.utils";
import logger from "./logger";

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req.headers.authorization;

    // Log the incoming request info (you can customize this)
    logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);

    if (!token) {
      const message = "Token not found: Unauthorized User!";
      logger.error(
        `${req.method} ${req.originalUrl} 401 Unauthorized - IP: ${req.ip} - ${message}`
      );
      throw new ApiError(httpStatus.UNAUTHORIZED, message);
    }

    let decoded;
    try {
      decoded = verifyToken(token, config.jwt_access_secret as string);
    } catch (error) {
      logger.error(
        `${req.method} ${req.originalUrl} 401 Unauthorized - IP: ${req.ip} - Unauthorized access happened`
      );
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized access happened"
      );
    }

    const { userId, role, iat } = decoded;
    const user = await User.findById(userId);

    if (!user) {
      const message = "User not found!";
      logger.error(
        `${req.method} ${req.originalUrl} 404 Not Found - IP: ${req.ip} - ${message}`
      );
      throw new ApiError(httpStatus.NOT_FOUND, message);
    }

    if (user.isDeleted) {
      const message = "User is deleted!";
      logger.error(
        `${req.method} ${req.originalUrl} 403 Forbidden - IP: ${req.ip} - ${message}`
      );
      throw new ApiError(httpStatus.FORBIDDEN, message);
    }

    if (user.status === "blocked") {
      const message = "User is blocked!";
      logger.error(
        `${req.method} ${req.originalUrl} 403 Forbidden - IP: ${req.ip} - ${message}`
      );
      throw new ApiError(httpStatus.FORBIDDEN, message);
    }

    if (
      user.passwordChangedAt &&
      new Date(user.passwordChangedAt).getTime() / 1000 > (iat as number)
    ) {
      const message = "Password changed recently: Unauthorized user!";
      logger.error(
        `${req.method} ${req.originalUrl} 401 Unauthorized - IP: ${req.ip} - ${message}`
      );
      throw new ApiError(httpStatus.UNAUTHORIZED, message);
    }

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      const message = "Role mismatched. Unauthorized User!";
      logger.error(
        `${req.method} ${req.originalUrl} 401 Unauthorized - IP: ${req.ip} - ${message}`
      );
      throw new ApiError(httpStatus.UNAUTHORIZED, message);
    }

    // Log successful authorization
    logger.info(
      `Authorized userId: ${userId}, role: ${role} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`
    );

    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
