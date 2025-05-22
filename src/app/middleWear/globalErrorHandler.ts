// middlewares/globalErrorHandler.ts
import { Request, Response, NextFunction } from "express";
import ApiError from "../errors/ApiError";

const globalErrorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails: process.env.NODE_ENV === "development" ? err : undefined,
  });
};

export default globalErrorHandler;
