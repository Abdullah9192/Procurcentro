import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Transaction } from "sequelize";
import { generateToken } from "../../../utils/general/JwtUtils";
import AppDataSource from "../../../../config/DatabaseSource";
import User from "../../../models/User";
import {
  errorResponse,
  successResponse,
} from "../../../utils/general/ResponseUtils";
import OrgRole from "../../../models/OrgRole";
import { executeVendorLogin } from "../../../respository/auth/AuthRepository";

export const handleRegisterVendor = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const transaction = await AppDataSource.transaction();
  const existing = await User.findOne({ where: { email }, transaction });
  if (!existing) {
    await transaction.rollback();
    res.status(400).json({ message: "Invalid email." });
    return;
  }
  if (existing.password) {
    await transaction.rollback();
    res.status(400).json({ message: "Account already set up. Please log in." });
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.update(
    { password: hashedPassword, is_email_verified: true },
    { where: { id: existing.id }, transaction }
  );
  const updated = await User.findOne({ where: { email }, transaction });
  if (!updated) {
    await transaction.rollback();
    res.status(404).json({ message: "Could not fetch updated user." });
    return;
  }
  await transaction.commit();
  const { password: _, ...userData } = updated.get({ plain: true });
  res.status(200).json({ user: userData });
};

export const handleVendorLogin = async (req: Request, res: Response): Promise<void> => {
  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeVendorLogin(req.body, transaction);

    if (!result.success) {
      await transaction.rollback();
      return void res.status(result.statusCode).json({
        message: result.message,
      });
    }

    await transaction.commit();

    return void res.status(result.statusCode).json({
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    await transaction.rollback();

    return void res.status(400).json({
      message: error?.message || "Something went wrong.",
    });
  }
};

export const getVendorDetail = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {
    const user_id = req.query.user_id as string;
    const organization_id = req.query.organization_id as string;
    const supplierDetail = await User.findOne({
      where: {
        id: user_id,
        organization_id: organization_id,
      },
    });

    if (!supplierDetail) {
      errorResponse(res, {
        message: "Supplier not found",
        statusCode: 404,
      });
      return;
    }

    successResponse(res, {
      message: "Vendor details retrieved successfully",
      data: supplierDetail,
    });
  } catch (error: any) {
    console.error("Error fetching vendor details:", error);
    errorResponse(res, {
      message: error.message || "Unexpected error occurred",
      statusCode: 500,
    });
  }
};

export const updateVendorStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "Vendor authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const supplierDetail = await User.findOne({
      where: {
        id: req.body?.user_id,
        organization_id: req.body?.organization_id,
      },
    });

    if (!supplierDetail) {
      errorResponse(res, {
        message: "Supplier not found",
        statusCode: 404,
      });
      return;
    }

    const payloadData = {
      supplier_status: req.body?.supplier_status,
      supplier_status_reason: req.body?.supplier_status_reason,
      is_supplier_capable: req.body?.is_supplier_capable || "false",
    };

    await supplierDetail.update(payloadData);

    successResponse(res, {
      message: "Vendor status updated successfully",
      data: supplierDetail,
    });
  } catch (error: any) {
    console.error("Error updating vendor status:", error);
    errorResponse(res, {
      message: error.message || "Unexpected error occurred",
      statusCode: 500,
    });
  }
};
// updateVendorData
export const updateVendorData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "Vendor authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const supplierDetail = await User.findOne({
      where: {
        id: req.params?.vendor_id,
      },
    });

    if (!supplierDetail) {
      errorResponse(res, {
        message: "Supplier not found",
        statusCode: 404,
      });
      return;
    }

    const payloadData = {
      onboard_completed: true,
    };

    await supplierDetail.update(payloadData);

    successResponse(res, {
      message: "Vendor Data updated successfully",
      data: supplierDetail,
    });
  } catch (error: any) {
    console.error("Error updating vendor status:", error);
    errorResponse(res, {
      message: error.message || "Unexpected error occurred",
      statusCode: 500,
    });
  }
};