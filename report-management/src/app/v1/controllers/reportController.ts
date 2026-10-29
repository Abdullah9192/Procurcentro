import {
  errorResponse,
  successResponse,
} from "../../utils/general/ResponseUtils";
import { Request, Response } from "express";

import {
  createReportRepository,
  getUserReportsRepository,
} from "../../respository/reportRepository";
import { User } from "../../types/userTypes";
import { createReportValidation } from "../validators/reportValidator";
import { GetReportsQuery } from "../../types/reportTypes";

// ===== create Auction
export const createReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as User;

    const { error } = await createReportValidation.validate(req.body);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: "Bad Request",
        error: error,
      });
    }

    const result = await createReportRepository(user, req.body);
    successResponse(res, {
      message: "",
      data: result,
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusCode: 500,
      message: "Server Error",
      error: error,
    });
  }
};

// ===== get all Auctions
export const getReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as User;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const query = req.query as GetReportsQuery;
    const result = await getUserReportsRepository(user, page, limit, query);
    successResponse(res, {
      message: "",
      data: result,
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusCode: 500,
      message: "Server Error",
      error: error,
    });
  }
};

// ===== get Auction by id
export const getReportById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    successResponse(res, {
      message: "",
      data: "result",
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusCode: 500,
      message: "Server Error",
      error: error,
    });
  }
};

// ===== update Auction

export const updateReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    successResponse(res, {
      message: "",
      data: "result",
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusCode: 500,
      message: "Server Error",
      error: error,
    });
  }
};
