import { Request, Response } from "express";
import {
  createApprovalWorkflowValidation,
  createWorkflowStepsValidation,
  getWorkflowValidation,
} from "../../validators/SetupValidation";
import {
  errorResponse,
  successResponse,
} from "../../../utils/general/ResponseUtils";
import AppDataSource from "../../../../config/DatabaseSource";
import {
  executeAddWorkflow,
  executeCreateWorkflowSteps,
  executeGetUsersForApprovalWorkflow,
  executeGetWorkflows,
} from "../../../respository/setup/ApprovalWorkflowRepository";
import ApprovalWorkflow from "../../../models/ApprovalWorkflow";
import ApprovalWorkflowStep from "../../../models/ApprovalWorkflowStep";
import ApprovalWorkflowStepApprover from "../../../models/ApprovalWorkflowStepApprover";
import User from "../../../models/User";
import OrgRole from "../../../models/OrgRole";

// ======= Add Category:
export const addWorkflow = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }

  const { error } = createApprovalWorkflowValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeAddWorkflow(req.body, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Create workflow.",
      error: err,
    });
  }
};

// ======= get Workflow list :
export const getWorkflowList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const requestData = {
    organization_id: user?.organization_id,
    subsidiary_id: req.query.subsidiary_id
      ? req.query.subsidiary_id
      : undefined,
    subsidiary_branch_id: req.query.subsidiary_branch_id
      ? req.query.subsidiary_branch_id
      : undefined,
    subsidiary_department_id: req.query.subsidiary_department_id
      ? req.query.subsidiary_department_id
      : undefined,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
  };

  const { error } = getWorkflowValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetWorkflows(requestData);

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get workflow list.",
      error: err,
    });
  }
};

export const addCreateWorkflowSteps = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }

  const { error } = createWorkflowStepsValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeCreateWorkflowSteps(
      req.body,
      user,
      transaction
    );
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Create workflow step.",
      error: err,
    });
  }
};

export const getApprovalWorkflowById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const workflow = await ApprovalWorkflow.findByPk(req.params.id, {
    include: [
      {
        model: ApprovalWorkflowStep,
        as: "steps",
        include: [
          {
            model: ApprovalWorkflowStepApprover,
            as: "approvers",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "email", "name"],
                include: [
                  {
                    model: OrgRole,
                    as: "org_role",
                    attributes: ["id", "role_name"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
  if (workflow) {
    successResponse(res, {
      statusCode: 200,
      message: "ApprovalWorkflow Data retrieved successfully.",
      data: workflow,
    });
  } else {
    errorResponse(res, {
      statusCode: 404,
      message: "Workflow Data not found.",
    });
  }
};

export const getApprovalWorkflowByIds = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { subsidiary_id, subsidiary_branch_id, branch_department_id } = req.params;
  try {
    const workflow = await ApprovalWorkflow.findOne({
      where: {
        subsidiary_id,
        subsidiary_branch_id,
        branch_department_id,
      },
      include: [
        {
          model: ApprovalWorkflowStep,
          as: "steps",
          include: [
            {
              model: ApprovalWorkflowStepApprover,
              as: "approvers",
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "email", "name"],
                  include: [
                    {
                      model: OrgRole,
                      as: "org_role",
                      attributes: ["id", "role_name"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (workflow) {
      successResponse(res, {
        statusCode: 200,
        message: "ApprovalWorkflow data retrieved successfully.",
        data: workflow,
      });
    } else {
      successResponse(res, {
        statusCode: 200,
        message: "ApprovalWorkflow not exist.",
        data: {},
      });
    }
  } catch (error) {
    console.error("Error fetching workflow:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error while retrieving workflow.",
    });
  }
};

// getUsersForApprovalWorkflow
export const getUsersForApprovalWorkflow = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const result = await executeGetUsersForApprovalWorkflow(req.params, user);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Fetch users for approval workflow.",
      error: err,
    });
  }
};
