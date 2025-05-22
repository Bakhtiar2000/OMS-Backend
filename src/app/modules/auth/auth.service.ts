import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { User } from "../user/user.model";
import { TLoginUser } from "./auth.interface";
import { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import bcrypt from "bcrypt";
import { createToken, verifyToken } from "./auth.utils";
import { sendEmail } from "../../utils/sendEmail";
import logger from "../../middleWear/logger";

const loginUser = async (payload: TLoginUser) => {
  const user = await User.findOne({ email: payload?.email }).select(
    "+password"
  );
  logger.info(`Login attempt for email: ${payload?.email}`);

  // Check if user exists
  if (!user) {
    logger.error(`Login failed: User not found - email: ${payload?.email}`);
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Check if user is deleted
  const isUserDeleted = user?.isDeleted;
  if (isUserDeleted) {
    logger.error(`Login failed: User is deleted - email: ${payload?.email}`);
    throw new ApiError(httpStatus.FORBIDDEN, "User is deleted!");
  }

  // Check if user is blocked
  const userStatus = user?.status;
  if (userStatus === "blocked") {
    logger.error(`Login failed: User is blocked - email: ${payload?.email}`);
    throw new ApiError(httpStatus.FORBIDDEN, "User is blocked!");
  }

  // Check if password is correct
  if (!(await bcrypt.compare(payload?.password, user?.password))) {
    logger.error(
      `Login failed: Password did not match - email: ${payload?.email}`
    );
    throw new ApiError(httpStatus.FORBIDDEN, "Password did not match!");
  }

  // Successful login
  logger.info(`Login successful for user: ${payload?.email}`);

  //----------------Create jsonwebtoken and send to the user-----------------
  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  //++++++++++++++++   ACCESS TOKEN   ++++++++++++++++
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    parseInt(config.jwt_access_expires_in as string)
  );
  //++++++++++++++++   Refresh TOKEN   ++++++++++++++++
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    parseInt(config.jwt_refresh_expires_in as string)
  );
  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  logger.info(`Password change requested for userId: ${userData.userId}`);

  const user = await User.findById(userData.userId).select("+password");

  // Check if user exists
  if (!user) {
    logger.error(
      `Password change failed: User not found - userId: ${userData.userId}`
    );
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Check if password is correct
  if (!(await bcrypt.compare(payload?.oldPassword, user?.password))) {
    logger.error(
      `Password change failed: Old password mismatch - userId: ${userData.userId}`
    );
    throw new ApiError(httpStatus.FORBIDDEN, "Password did not match!");
  }

  // Hash new password
  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    {
      _id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  );

  logger.info(`Password changed successfully for userId: ${userData.userId}`);

  return null;
};

const refreshToken = async (token: string) => {
  logger.info(`Refresh token request received.`);

  // checking if the given token is valid
  let decoded;
  try {
    decoded = verifyToken(token, config.jwt_refresh_secret as string);
  } catch (error) {
    logger.error(`Refresh token verification failed: Invalid token.`);
    throw error; // Let ApiError or caller handle it
  }

  const { userId, iat } = decoded;
  logger.info(`Refresh token decoded for userId: ${userId}`);

  // checking if the user exists
  const user = await User.findById(userId);
  if (!user) {
    logger.error(`Refresh token failed: User not found - userId: ${userId}`);
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found !");
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    logger.error(`Refresh token failed: User deleted - userId: ${userId}`);
    throw new ApiError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === "blocked") {
    logger.error(`Refresh token failed: User blocked - userId: ${userId}`);
    throw new ApiError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    parseInt(config.jwt_access_expires_in as string)
  );

  logger.info(`Access token refreshed successfully for userId: ${userId}`);

  return {
    accessToken,
  };
};

const forgetPassword = async (email: string) => {
  logger.info(`Password reset requested for email: ${email}`);

  // checking if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    logger.error(`Password reset failed: User not found - email: ${email}`);
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found !");
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    logger.error(`Password reset failed: User deleted - email: ${email}`);
    throw new ApiError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === "blocked") {
    logger.error(`Password reset failed: User blocked - email: ${email}`);
    throw new ApiError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    1000 * 60 * 10 // 10 minutes
  );

  const resetUILink = `${config.reset_pass_ui_link}/reset-password?token=${resetToken}`;
  logger.info(
    `Password reset link generated for email: ${email} - Link expires in 10 minutes.`
  );

  sendEmail(
    user?.email,
    `
    <div>
        <p>Dear User,</p>
        <p>Click on this Button to reset password. Link expires in 10 minutes.</p> 
        <p>
            <a href=${resetUILink}>
                <button>
                    Reset Password
                </button>
            </a>
        </p>
    </div>
    `
  );
};

const resetPassword = async (
  payload: { newPassword: string },
  token: string
) => {
  logger.info(`Reset password attempt with token: ${token}`);

  const decoded = verifyToken(token, config.jwt_access_secret as string);

  // checking if the user exists
  const user = await User.findById(decoded.userId);
  if (!user) {
    logger.error(
      `Reset password failed: User not found - userId: ${decoded.userId}`
    );
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found !");
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    logger.error(
      `Reset password failed: User deleted - userId: ${decoded.userId}`
    );
    throw new ApiError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === "blocked") {
    logger.error(
      `Reset password failed: User blocked - userId: ${decoded.userId}`
    );
    throw new ApiError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  // Hash new password
  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    {
      _id: decoded.userId,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  );

  logger.info(`Password reset successful for userId: ${decoded.userId}`);
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
