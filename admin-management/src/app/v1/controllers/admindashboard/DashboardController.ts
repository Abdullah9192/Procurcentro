import { NextFunction, Request, Response } from "express";
import dayjs from "dayjs";
import { QueryTypes } from "sequelize";
import { getDashboardService, procurementDashboardService, upsertDashboardService } from "../../../respository/admindashboard/AdminDashboard";
import { ValidationService } from "../../../services/ValidationService";

export const procurementDashboardController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { organization_id, subsidiary_id } = req.params;

    const {
      filter = "today", // today | last30 | last7 | last3months | last6months | custom
      start_date,
      end_date,
    } = req.query;

    const data = await procurementDashboardService(
      organization_id,
      subsidiary_id,
      filter as string,
      start_date as string,
      end_date as string,
    );

    return void res.status(200).json({
      message: "Procurement dashboard fetched successfully",
      data,
    });
  } catch (error) {
    return void res.status(500).json({
      message: "Dashboard error",
      error,
    });
  }
};

export class ValidationController {
  static validateBulk = async (req: Request, res: Response): Promise<void> => {
    try {
      const { organization_id, rows } = req.body;

      if (!organization_id || !rows || !Array.isArray(rows)) {
        res.status(400).json({ message: "Invalid payload" });
        return;
      }

      const result = await ValidationService.validateBulkRows(
        organization_id,
        rows
      );

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

/* ================= CREATE / UPDATE ================= */
export const upsertDashboardController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = await upsertDashboardService(req.body);

    return void res.status(200).json({
      message: 'Dashboard saved successfully',
      data,
    });
  } catch (error: any) {
    return void res.status(500).json({
      message: 'Dashboard error',
      error: error.message,
    });
  }
};

/* ================= GET BY ORG ================= */
export const getDashboardController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // try {
    const user = (req as any).user;
    console.log(user);
    
    if (!user?.organization_id) {
      return void res.status(401).json({
        message: 'User authentication required',
      });
    }

    const data = await getDashboardService(user.organization_id);

    if (!data) {
      return void res.status(404).json({
        message: 'Dashboard not found',
      });
    }

    return void res.status(200).json({
      message: 'Dashboard fetched successfully',
      data,
    });
  // } catch (error: any) {
  //   console.error('DASHBOARD ERROR:', error);

  //   return void res.status(500).json({
  //     message: 'Dashboard error',
  //     error: error?.message || error,
  //   });
  // }
};

