import { Op, QueryTypes, WhereOptions } from "sequelize";
import { Reports } from "../models/index";
import { User } from "../types/userTypes";
import { paginate } from "../utils/utils";
import { getCategoriesApi } from "../v1/servicesApis/adminServiceApi";
import { reportTypes } from "../utils/constants";
import AppDataSource from "../../config/DatabaseSource";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";
import { ReportAttributes } from "../models/ReportModel";
import { GetReportsQuery } from "../types/reportTypes";

// =========== create auction
export const createReportRepository = async (
  user: User,
  payload: ReportAttributes
) => {
  try {
    const data = payload;
    data.created_by = user?.id ?? null;

    const result = await Reports.create(data);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

// =========== get auctions
// export const getUserReportsRepository = async (
//   user: User,
//   page: number,
//   limit: number,
//   query: GetReportsQuery
//   // token: string | undefined
// ) => {
//   try {
//     const serachQuery: WhereOptions = {};
//     if (query.subsidiary_id) {
//       serachQuery.subsidiary_id = query.subsidiary_id;
//     }
//     const result = await paginate(Reports, {
//       where: serachQuery,
//       limit,
//       page,
//     });
//     return result;
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       throw new Error(error.message); // keep original message
//     }
//     throw new Error("An unknown error occurred"); // handle other cases
//   }
// };
export const getUserReportsRepository = async (
  user: User,
  page: number,
  limit: number,
  query: GetReportsQuery
) => {
  try {
    const where: WhereOptions = {};

    if (query.subsidiary_id) {
      where.subsidiary_id = query.subsidiary_id;
    }

    // get all reports (you can apply pagination later if needed)
    const reports = await Reports.findAll({ where });

    // ==============================
    // GROUP REPORTS BY TYPE
    // ==============================
    const grouped: Record<string, any[]> = {};

    // initialize empty arrays for each type
    Object.values(reportTypes).forEach((type) => {
      grouped[type] = [];
    });

    // push reports into their respective type group
    reports.forEach((report) => {
      const type = report.report_type;
      if (grouped[type]) {
        grouped[type].push(report);
      }
    });

    // 1️⃣ Total Reports Generated
    const totalReportsGenerated = reports.length;

    // 2️⃣ Top Spend Category (most report frequencies)
    let topSpendCategory = null;
    let highestSpend = 0;

    for (const type of Object.keys(grouped)) {
      const categoryReports = grouped[type];

      // total spend = sum(max_price)
      const totalSpend = categoryReports.reduce((sum, report) => {
        return sum + (report.max_price || 0);
      }, 0);

      if (totalSpend > highestSpend) {
        highestSpend = totalSpend;
        topSpendCategory = {
          category: type,
          total_spend: totalSpend,
        };
      }
    }

    // 3️⃣ Cost Savings = SUM(max_price - min_price)
    const costSavings = reports.reduce((sum, r) => {
      if (r.max_price && r.min_price) {
        return sum + (r.max_price - r.min_price);
      }
      return sum;
    }, 0);

    return {
      total: reports.length,
      stats: {
        totalReportsGenerated,
        topSpendCategory,
        costSavings,
      },
      groupedReports: grouped,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

// =========== get auction by id
export const getAutciotnByIdRepository = async (id: string) => {
  try {
    const result = true;
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message); // keep original message
    }
    throw new Error("An unknown error occurred"); // handle other cases
  }
};

// =========== update auction
export const updateAuctionRepository = async (id: string, data: any) => {
  try {
    const updateData = true;
    return updateData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message); // keep original message
    }
    throw new Error("An unknown error occurred"); // handle other cases
  }
};

// ======== repositories for employee
