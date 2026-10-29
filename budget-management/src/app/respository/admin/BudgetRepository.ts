import { Op, Sequelize, Transaction } from "sequelize";
import { getOrganizationById } from "../../../grpc/clients/AdminGrpcClient";
import { BaseService } from "../../services/BaseService";
import Budget from "../../models/Budget";
import BudgetItem from "../../models/BudgetItem";
import BudgetAttachment from "../../models/BudgetAttachment";
import {
  deleteAzureFiles,
  extractFilenameFromUrl,
  extractMimeTypeFromUrl,
} from "../../services/FileService";
import { service } from "../../../config/EnvVariables";
import { resolveBudgetRelations } from "../../services/BudgetGrpcService";
import { http } from "../../services/AxiosClient";

const budgetService = new BaseService(Budget);
const budgetItemService = new BaseService(BudgetItem);
const attachmentService = new BaseService(BudgetAttachment);
export const executeAddBudget = async (
  budgetData: any,
  user: any,
  transaction?: Transaction
) => {
  const userId = user.id;
  try {
    await getOrganizationById(budgetData.organization_id);
  } catch (error: any) {
    deleteAzureFiles(budgetData.attachment_files);
    return {
      success: false,
      statusCode: 400,
      message: "Failed to fetch organization from grpc-service",
      error: error?.details,
    };
  }
  const budget = await budgetService.create(
    {
      name: budgetData.name,
      org_category_id: budgetData.org_category_id,
      org_currency_id: budgetData.org_currency_id,
      budget_cycle: budgetData.budget_cycle,
      duration: budgetData.duration,
      start_date: budgetData.start_date,
      end_date: budgetData.end_date,
      notes: budgetData.notes,
      status: budgetData.status || "draft",
      approval_workflow_id: budgetData.approval_workflow_id,
      subsidiary_id: budgetData.subsidiary_id,
      subsidiary_branch_id: budgetData.subsidiary_branch_id,
      branch_department_id: budgetData.branch_department_id,
      organization_id: budgetData.organization_id,
      created_by: userId,
      total_budget: budgetData.total_budget,
    },
    { transaction }
  );

  // Create Budget Items
  let savedBudgetItems: any[] = [];
  if (
    Array.isArray(budgetData.budget_items) &&
    budgetData.budget_items.length > 0
  ) {
    const itemsToInsert = budgetData.budget_items.map((item: any) => ({
      budget_id: budget.id,
      org_sub_category_id: item.org_sub_category_id,
      item_name: item.item_name,
      amount: item.amount,
      warning_limit: item.warning_limit,
      allow_exceed_budget: item.allow_exceed_budget || false,
      limit_exceed_amount: item.limit_exceed_amount,
    }));

    savedBudgetItems = await budgetItemService.bulkCreate(itemsToInsert, {
      transaction,
    });
  }

  // Create Attachments
  let savedAttachments: any[] = [];
  if (
    Array.isArray(budgetData.attachment_files) &&
    budgetData.attachment_files.length > 0
  ) {
    const attachmentsToInsert = budgetData.attachment_files.map(
      (fileUrl: string, index: number) => {
        const metadata = budgetData.attachments_metadata?.[index] || {};
        const filename = extractFilenameFromUrl(fileUrl);
        const mimeType =
          extractMimeTypeFromUrl(fileUrl) || "application/octet-stream";

        return {
          budget_id: budget.id,
          filename,
          original_name: filename,
          file_path: fileUrl,
          file_size: 0,
          mime_type: mimeType,
          ...metadata,
        };
      }
    );
    savedAttachments = await attachmentService.bulkCreate(attachmentsToInsert, {
      transaction,
    });
  }

  return {
    success: true,
    statusCode: 201,
    message: "Budget created successfully",
    data: {
      ...budget,
      budget_items: savedBudgetItems,
      attachments: savedAttachments,
    },
  };
};

// budget list Data :
export const executeGetBudgetList = async (payload: any, user: any) => {
  const {
    page,
    limit,
    query,
    queryKey,
    status,
    organization_id,
    category_id,
    subsidiary_id,
    subsidiary_branch_id,
    branch_department_id,
    search,
    cycle,
    initiator,
  } = payload;

  try {
    await getOrganizationById(organization_id);
  } catch (error: any) {
    return {
      success: false,
      statusCode: 400,
      message: "Failed to fetch organization from grpc-service",
      error: error?.details,
    };
  }

  const whereCondition: any = { organization_id };

  if (query && queryKey && query.trim() && queryKey.trim()) {
    whereCondition[queryKey.trim()] = {
      [Op.iLike]: `%${query.trim()}%`,
    };
  }

  if (status) {
    if (Array.isArray(status)) {
      whereCondition.status = { [Op.in]: status };
    } else {
      whereCondition.status = status;
    }
  }

  if (category_id) {
    whereCondition.org_category_id = category_id;
  }

  if (subsidiary_id) {
    whereCondition.subsidiary_id = subsidiary_id;
  }

  if (subsidiary_branch_id) {
    whereCondition.subsidiary_branch_id = subsidiary_branch_id;
  }

  if (branch_department_id) {
    whereCondition.branch_department_id = branch_department_id;
  }

  if (search && search.trim()) {
    whereCondition.name = {
      [Op.iLike]: `%${search.trim()}%`,
    };
  }

  // ✅ NEW: Cycle filter
  if (cycle) {
    whereCondition.budget_cycle = cycle;
  }

  // ✅ NEW: Initiator filter (UUID)
  if (initiator) {
    whereCondition.created_by = initiator;
  }

  const currentPage = parseInt(page) || 1;
  const currentLimit = parseInt(limit) || 10;
  const offset = (currentPage - 1) * currentLimit;

  const { count: totalCount, rows: rawBudgets } = await Budget.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: BudgetItem,
        as: "items",
      },
    ],
    limit: page && limit ? currentLimit : undefined,
    offset: page && limit ? offset : undefined,
    order: [["created_at", "DESC"]],
    raw: true,
  });

  const budgetList = await Promise.all(rawBudgets.map(resolveBudgetRelations));

  return {
    success: true,
    statusCode: 200,
    message: "Budget list fetched successfully",
    data:
      page && limit
        ? {
          budgetList,
          pagination: {
            currentPage,
            totalPages: Math.ceil(totalCount / currentLimit),
            totalCount,
            hasNextPage: currentPage < Math.ceil(totalCount / currentLimit),
            hasPrevPage: currentPage > 1,
          },
        }
        : budgetList,
  };
};

// budget details :
export const executeGetBudgetDetail = async (payload: any) => {
  const { organization_id, budget_id, token } = payload;

  try {
    await getOrganizationById(organization_id);
  } catch (error: any) {
    return {
      success: false,
      statusCode: 400,
      message: "Failed to fetch organization from grpc-service",
      error: error?.details,
    };
  }

  const budget = await budgetService.findOne({
    where: {
      id: budget_id,
      organization_id,
    },
    include: [
      {
        model: BudgetItem,
        as: "budget_items",
      },
      {
        model: BudgetAttachment,
        as: "budget_attachments",
      },
    ],
  });

  if (!budget) {
    return {
      success: false,
      statusCode: 404,
      message: "Budget not found",
    };
  }
  const enrichedBudget = await resolveBudgetRelations(budget);
  let approvalWorkflow = null;
  if (budget.approval_workflow_id) {
    const response = await http.get(
      `/v1/organization/approval-workflow/${budget.approval_workflow_id}`,
      undefined,
      {
        token,
        baseURL: service.ADMIN_SERVICE_URL,
      }
    );

    if (response.success) {
      approvalWorkflow = response.data;
    }
  }
  return {
    success: true,
    statusCode: 200,
    message: "Budget fetched successfully",
    data: {
      ...enrichedBudget,
      approval_workflow: approvalWorkflow,
    },
  };
};

// Budget Data :

export const executeGetBudgetData = async (payload: any) => {
  const {
    organization_id,
    org_category_id,
    subsidiary_id,
    subsidiary_branch_id,
    branch_department_id,
  } = payload;

  try {
    await getOrganizationById(organization_id);
  } catch (error: any) {
    return {
      success: false,
      statusCode: 400,
      message: "Failed to fetch organization from grpc-service",
      error: error?.details,
    };
  }

  const today = new Date();

  const budgets = await budgetService.findAll({
    where: {
      organization_id,
      org_category_id,
      subsidiary_id,
      subsidiary_branch_id,
      branch_department_id,
      // status: "completed",
      // start_date: { [Op.lte]: today },
      // end_date: { [Op.gte]: today },
    },
    include: [
      {
        model: BudgetItem,
        as: "budget_items",
      },
    ],
  });

  if (!budgets || budgets.length === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Budget not found",
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: "Budget Data fetched successfully",
    data: budgets,
  };
};

//  executeStatusBudget :
export const executeStatusBudget = async (payload: any) => {
  const { organization_id, budget_id, status, updated_by } = payload;
  try {
    await getOrganizationById(organization_id);
  } catch (error: any) {
    return {
      success: false,
      statusCode: 400,
      message: "Failed to fetch organization from grpc-service",
      error: error?.details,
    };
  }
  const budget = await budgetService.findOne({
    where: {
      id: budget_id,
      organization_id,
    },
  });
  if (!budget) {
    return {
      success: false,
      statusCode: 404,
      message: "Budget not found",
    };
  }
  await budgetService.update(
    {
      status: status,
      last_action_by: updated_by,
    },
    {
      where: {
        id: budget_id,
        organization_id,
      },
    }
  );
  return {
    success: true,
    statusCode: 200,
    message: "Budget status updated successfully",
    data: budget,
  };
};

// export const executeGetBudgetSummary = async (user: any) => {
//   const organization_id = user.organization_id;

//   try {
//     await getOrganizationById(organization_id);
//   } catch (error: any) {
//     return {
//       success: false,
//       statusCode: 400,
//       message: "Failed to fetch organization from grpc-service",
//       error: error?.details,
//     };
//   }

//   try {
//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);

//     const endOfMonth = new Date();
//     endOfMonth.setMonth(endOfMonth.getMonth() + 1);
//     endOfMonth.setDate(0);
//     endOfMonth.setHours(23, 59, 59, 999);

//     const aggregated: any = await Budget.findOne({
//       attributes: [
//         [Sequelize.fn("SUM", Sequelize.col("total_budget")), "total_budget"],
//         [
//           Sequelize.fn("SUM", Sequelize.col("spent_budget_amount")),
//           "spent_budget_amount",
//         ],
//       ],
//       where: {
//         organization_id,
//         created_at: {
//           [Op.between]: [startOfMonth, endOfMonth],
//         },
//       },
//       raw: true,
//     });

//     const totalBudget = Number(aggregated?.total_budget) || 0;
//     const totalSpend = Number(aggregated?.spent_budget_amount) || 0;
//     const budgetBalance = Math.max(totalBudget - totalSpend, 0);
//     const overBudgetSpend = Math.max(totalSpend - totalBudget, 0);

//     return {
//       success: true,
//       statusCode: 200,
//       message: "Monthly summary calculated",
//       data: {
//         totalBudget,
//         totalSpend,
//         budgetBalance,
//         overBudgetSpend,
//       },
//     };
//   } catch (error: any) {
//     return {
//       success: false,
//       statusCode: 500,
//       message: "Failed to calculate budget summary",
//       error,
//     };
//   }
// };


export const executeGetBudgetSummary = async (user: any) => {
  const organization_id = user.organization_id;

  try {
    await getOrganizationById(organization_id);
  } catch (error: any) {
    return {
      success: false,
      statusCode: 400,
      message: "Failed to fetch organization from grpc-service",
      error: error?.details,
    };
  }

  try {
    // ✅ Current Month
    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);
    startOfCurrentMonth.setHours(0, 0, 0, 0);

    const endOfCurrentMonth = new Date();
    endOfCurrentMonth.setMonth(endOfCurrentMonth.getMonth() + 1);
    endOfCurrentMonth.setDate(0);
    endOfCurrentMonth.setHours(23, 59, 59, 999);

    // ✅ Previous Month
    const startOfPrevMonth = new Date(startOfCurrentMonth);
    startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);

    const endOfPrevMonth = new Date(startOfCurrentMonth);
    endOfPrevMonth.setDate(0);
    endOfPrevMonth.setHours(23, 59, 59, 999);

    // ✅ Helper functions
    const getPercentage = (curr: number, prev: number) => {
      if (prev === 0) return curr === 0 ? 0 : 100;
      return ((curr - prev) / prev) * 100;
    };

    const getTrend = (curr: number, prev: number) => {
      if (curr > prev) return "up";
      if (curr < prev) return "down";
      return "same";
    };

    // ✅ Current Month Data
    const current: any = await Budget.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("total_budget")), "total_budget"],
        [Sequelize.fn("SUM", Sequelize.col("spent_budget_amount")), "spent_budget_amount"],
      ],
      where: {
        organization_id,
        created_at: {
          [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
        },
      },
      raw: true,
    });

    // ✅ Previous Month Data
    const previous: any = await Budget.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("total_budget")), "total_budget"],
        [Sequelize.fn("SUM", Sequelize.col("spent_budget_amount")), "spent_budget_amount"],
      ],
      where: {
        organization_id,
        created_at: {
          [Op.between]: [startOfPrevMonth, endOfPrevMonth],
        },
      },
      raw: true,
    });

    // ✅ Current values
    const currentTotal = Number(current?.total_budget) || 0;
    const currentSpend = Number(current?.spent_budget_amount) || 0;
    const currentBalance = Math.max(currentTotal - currentSpend, 0);
    const currentOverSpend = Math.max(currentSpend - currentTotal, 0);

    // ✅ Previous values
    const prevTotal = Number(previous?.total_budget) || 0;
    const prevSpend = Number(previous?.spent_budget_amount) || 0;
    const prevBalance = Math.max(prevTotal - prevSpend, 0);
    const prevOverSpend = Math.max(prevSpend - prevTotal, 0);

    // ✅ % changes
    const totalBudgetChange = getPercentage(currentTotal, prevTotal);
    const spendChange = getPercentage(currentSpend, prevSpend);
    const balanceChange = getPercentage(currentBalance, prevBalance);
    const overSpendChange = getPercentage(currentOverSpend, prevOverSpend);

    // ✅ Trends
    const totalBudgetTrend = getTrend(currentTotal, prevTotal);
    const spendTrend = getTrend(currentSpend, prevSpend);
    const balanceTrend = getTrend(currentBalance, prevBalance);
    const overSpendTrend = getTrend(currentOverSpend, prevOverSpend);

    return {
      success: true,
      statusCode: 200,
      message: "Monthly summary calculated",
      data: {
        totalBudget: {
          current: currentTotal,
          previous: prevTotal,
          change: Number(totalBudgetChange.toFixed(2)),
          trend: totalBudgetTrend,
        },
        totalSpend: {
          current: currentSpend,
          previous: prevSpend,
          change: Number(spendChange.toFixed(2)),
          trend: spendTrend,
        },
        budgetBalance: {
          current: currentBalance,
          previous: prevBalance,
          change: Number(balanceChange.toFixed(2)),
          trend: balanceTrend,
        },
        overBudgetSpend: {
          current: currentOverSpend,
          previous: prevOverSpend,
          change: Number(overSpendChange.toFixed(2)),
          trend: overSpendTrend,
        },
      },
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to calculate budget summary",
      error,
    };
  }
};
