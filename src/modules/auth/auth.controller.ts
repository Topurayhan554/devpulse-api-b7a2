import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";
import { USER_ROLE } from "../../types";
import type { ILoginBody, IRegisterBody } from "./auth.inteface";

const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as IRegisterBody;

    if (!name || !email || !password) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "name, email, and password are required.",
      });
      return;
    }

    if (role && !Object.values(USER_ROLE).includes(role)) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "role must be 'contributor' or 'maintainer'.",
      });
      return;
    }

    const user = await authService.registerUserIntoDB({
      name,
      email,
      password,
      role,
    });

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    const err = error as Error;

    if (err.message === "EMAIL_TAKEN") {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "Email is already registered.",
      });
      return;
    }

    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message,
    });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as ILoginBody;

    if (!email || !password) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "email and password are required.",
      });
      return;
    }

    const result = await authService.loginUser({ email, password });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const err = error as Error;

    if (err.message === "INVALID_CREDENTIALS") {
      sendResponse(res, {
        statusCode: StatusCodes.UNAUTHORIZED,
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message,
    });
  }
};

export const authController = {
  signup,
  login,
};
