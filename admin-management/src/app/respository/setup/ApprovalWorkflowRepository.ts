import { Op, Transaction } from "sequelize";
import { BaseService } from "../../services/BaseService";
import ApprovalWorkflow from "../../models/ApprovalWorkflow";
import ApprovalWorkflowStep from "../../models/ApprovalWorkflowStep";
import ApprovalWorkflowStepApprover from "../../models/ApprovalWorkflowStepApprover";
import User from "../../models/User";

// Initialize services
const workflowService = new BaseService(ApprovalWorkflow);
const workflowStepService = new BaseService(ApprovalWorkflowStep);
const workflowStepApproverService = new BaseService(
  ApprovalWorkflowStepApprover
);

export const executeAddWorkflow = async (
  data: any,
  user: any,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;

  const enrichedPayload = {
    ...data,
    organization_id,
  };

  const existingWorkflow = await workflowService.findOne({
    where: {
      name: data?.name,
      organization_id,
    },
  });

  if (existingWorkflow) {
    return {
      success: false,
      statusCode: 400,
      message: `workflow with same name already exist`,
    };
  }
  const existingWorkflowByIds = await workflowService.findOne({
    where: {
      organization_id,
      subsidiary_id: data?.subsidiary_id,
      subsidiary_branch_id: data?.subsidiary_branch_id,
      branch_department_id: data?.branch_department_id,
    },
  });
  if (existingWorkflowByIds) {
    return {
      success: false,
      statusCode: 400,
      message: `workflow with same Subsidiary , Branch and Department already exist}`,
    };
  }

  const savedRecords = await workflowService.create(enrichedPayload, {
    transaction,
  });

  return {
    success: true,
    statusCode: 201,
    message: "workflow Created Successfully!",
    data: savedRecords,
  };
};

export const executeGetWorkflows = async (requestData: any) => {
  let result;

  const {
    page,
    limit,
    organization_id,
    subsidiary_id,
    subsidiary_branch_id,
    subsidiary_department_id,
  } = requestData;
  const whereCondition: any = {
    organization_id: organization_id,
  };

  if (subsidiary_id) {
    whereCondition.subsidiary_id = subsidiary_id;
  }

  if (subsidiary_branch_id) {
    whereCondition.subsidiary_branch_id = subsidiary_branch_id;
  }

  if (subsidiary_department_id) {
    whereCondition.subsidiary_department_id = subsidiary_department_id;
  }

  const includeOptions = [
    {
      model: ApprovalWorkflowStep,
      as: "steps",
      include: [
        {
          model: ApprovalWorkflowStepApprover,
          as: "approvers",
          include: [
            {
              model: ApprovalWorkflowStep,
              as: "step", // This will include the step details for each approver
            },
          ],
        },
      ],
    },
  ];

  if (page && limit) {
    result = await workflowService.paginate({
      page,
      limit,
      options: {
        where: whereCondition,
        include: includeOptions,
      },
    });
  } else {
    const workflowList = await workflowService.findAll({
      where: whereCondition,
      include: includeOptions,
    });
    result = {
      data: workflowList,
      total: workflowList.length,
      pages: 1,
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Workflow list fetched successfully",
    data: result,
  };
};

export const executeCreateWorkflowSteps = async (
  data: any,
  user: any,
  transaction: Transaction
) => {
  const { workflow_id, approval_type, steps } = data;
  const organization_id = user?.organization_id;
  const workflow = await workflowService.findOne({
    where: {
      id: workflow_id,
      organization_id,
    },
  });

  if (!workflow) {
    return {
      success: false,
      statusCode: 404,
      message: "Workflow not found for the given organization.",
    };
  }

  await workflowService.update(
    { approval_type },
    {
      where: {
        id: workflow_id,
        organization_id,
      },
      transaction,
    }
  );

  const stepPayloads = steps.map((step: any) => ({
    workflow_id,
    organization_id,
    step_number: step.step_number,
  }));

  const savedSteps = await workflowStepService.bulkCreate(stepPayloads, {
    transaction,
  });

  const approverPayloads = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const savedStep = savedSteps[i];

    for (const user_id of step.approver_user_ids) {
      approverPayloads.push({
        step_id: savedStep.id,
        user_id,
      });
    }
  }

  const allApprovers = await workflowStepApproverService.bulkCreate(
    approverPayloads,
    { transaction }
  );

  const approversByStepId = allApprovers.reduce((acc, approver) => {
    if (!acc[approver.step_id]) {
      acc[approver.step_id] = [];
    }
    acc[approver.step_id].push(approver);
    return acc;
  }, {});

  const stepsWithApprovers = savedSteps.map((step) => ({
    ...step,
    approvers: approversByStepId[step.id] || [],
  }));

  return {
    success: true,
    statusCode: 201,
    message: "Workflow steps created successfully!",
    data: stepsWithApprovers,
  };
};

// executeGetUsersForApprovalWorkflow
export const executeGetUsersForApprovalWorkflow = async (
  params: any,
  user: any
) => {
  const { subsidiary_branch_id, branch_department_id, subsidiary_id } = params;
  const users = await User.findAll({
    where: {
      ...(subsidiary_branch_id && { subsidiary_branch_id }),
      ...(branch_department_id && { branch_department_id }),
      ...(subsidiary_id && { subsidiary_id }),
      organization_id: user.organization_id,
      user_type: "employee",
      is_active: true,
    },
  });
  return {
    success: true,
    statusCode: 200,
    message: "Users list fetched successfully",
    data: users,
  };
};
