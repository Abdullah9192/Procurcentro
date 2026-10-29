import {
  errorResponse,
  successResponse,
} from "../../utils/general/ResponseUtils";
import { Request, Response } from "express";
import {
  createAuctionValidation,
  updateAuctionValidation,
  createUpdateBidValidation,
} from "../validators/auctionValidator";
import {
  createAuctionRepository,
  getUserAuctionsRepository,
  getAutciotnByIdRepository,
  updateAuctionRepository,
  // ======= employee
  getAuctionsForEmployeeRepository,
  bidOnAcutionRepository,
  getAuctionBidsRepository,
  getMyAuctionsRepository,
} from "../../respository/auctionRepository";
import { User } from "../../types/userTypes";

// ===== create Auction
export const createAuction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as User;

    const { error } = await createAuctionValidation.validate(req.body);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }
    const result = await createAuctionRepository(user, req.body);
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
export const getAuctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const user = req.user as User;
    const token = req.headers.authorization?.split(" ")[1];
    const result = await getUserAuctionsRepository(
      user,
      page,
      limit,
      req.query,
      token
    );
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
export const getAuctionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const result = await getAutciotnByIdRepository(id);
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

// ===== update Auction

export const updateAuction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const auctionId = req.params.id;
    const { error } = await updateAuctionValidation.validate(req.body);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }
    const result = await updateAuctionRepository(auctionId, req.body);
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

// =========Employees Auctions

// ======= get auctions for employee
export const getAuctionsForEmpoyee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const user = req.user as User;

    const result = await getAuctionsForEmployeeRepository(
      user,
      page,
      limit,
      req.query
    );
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

export const createUpdateBid = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error } = await createUpdateBidValidation.validate(req.body);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }
    const user = req.user as User;
    const result = await bidOnAcutionRepository(user, req.body);
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

export const getAuctionBids = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    const user = req.user as User;
    const id = req.params.auction_id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await getAuctionBidsRepository(user, id, page, limit, token);
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

export const getMyAuctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    const user = req.user as User;

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await getMyAuctionsRepository(user, page, limit, token);

    successResponse(res, {
      message: "",
      data: result,
    });
  } catch (error) {
    errorResponse(res, {
      statusCode: 500,
      message: "Server Error",
      error,
    });
  }
};

