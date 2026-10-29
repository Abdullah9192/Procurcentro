import { Transaction } from "sequelize";
import Organization from "../../models/Organization";
import { BaseService } from "../../services/BaseService";
import Subsidiary from "../../models/Subsidiary";
import SubsidiaryBranch from "../../models/SubsidiaryBranch";
import BranchDepartment from "../../models/BranchDepartment";

// Initialize services
const organizationService = new BaseService(Organization);
const subsidiaryService = new BaseService(Subsidiary);
const branchService = new BaseService(SubsidiaryBranch);
const departmentService = new BaseService(BranchDepartment);

export const executeUpdateOrganization = async (
  data: any,
  transaction: Transaction
) => {
  const { id, file, folderName, ...updates } = data;
  const existingOrganization = await organizationService.findOne({
    where: { id },
    transaction,
  });

  if (!existingOrganization) {
    return {
      success: false,
      statusCode: 400,
      message: "Organization doesn't exist",
    };
  }

  await organizationService.update(
    { logo: file, ...updates },
    {
      where: { id: existingOrganization.id },
      transaction,
    }
  );

  return {
    success: true,
    statusCode: 200,
    message: "Organization Info updated successfully!",
  };
};

export const executeGetOrganization = async (
  organization_id: string,
) => {
  const organizationDetail = await organizationService.findOne({
    where: { id: organization_id },
  });

  return {
    success: true,
    statusCode: 200,
    message: "Organization Info fetched successfully",
    data: organizationDetail,
  };
};

export const executeAddSubsidiary = async (
  data: any[],
  user: any,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;

  const enrichedPayload = data.map((item) => ({
    ...item,
    organization_id,
  }));

  const savedRecords = await subsidiaryService.bulkCreate(enrichedPayload, {
    transaction,
  });

  return {
    success: true,
    statusCode: 200,
    message: "Subsidiaries Created Successfully!",
    data: savedRecords,
  };
};

export const executeGetSubsidiaries = async (
  requestData: any,
) => {
  const { page, limit, organization_id } = requestData;

  const whereCondition = {
    organization_id,
  };

  if (!page && !limit) {
    const subsidiariesList = await Subsidiary.findAll({
      where: whereCondition,
      raw: true,
    });

    return {
      success: true,
      statusCode: 200,
      message: "Subsidiary list fetched successfully",
      data: subsidiariesList,
    };
  }

  // Pagination logic
  const currentPage = parseInt(page) || 1;
  const currentLimit = parseInt(limit) || 10;
  const offset = (currentPage - 1) * currentLimit;

  const { count: totalCount, rows: subsidiariesList } =
    await Subsidiary.findAndCountAll({
      where: whereCondition,
      limit: currentLimit,
      offset,
      order: [["created_at", "DESC"]],
      raw: true,
    });

  const totalPages = Math.ceil(totalCount / currentLimit);

  return {
    success: true,
    statusCode: 200,
    message: "Subsidiary list fetched successfully",
    data: {
      subsidiaries: subsidiariesList,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    },
  };
};


// ====== Update Subsidiary
export const executeUpdateSubsidiary = async (
  id: string,
  data: any,
  user: any,
  transaction: Transaction
) => {
  const subsidiary = await Subsidiary.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!subsidiary) {
    return {
      success: false,
      statusCode: 400,
      message: "Subsidiary doesn't exist",
    };
  }
  await Subsidiary.update(data, {
    where: { id: subsidiary.id },
    transaction,
  });
  return {
    success: true,
    statusCode: 200,
    message: "Subsidiaries Updated Successfully!",
    data: subsidiary,
  };
};

// ======= Delete Subsidiary
export const executeDeleteSubsidiary = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const subsidiary = await Subsidiary.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!subsidiary) {
    return {
      success: false,
      statusCode: 404,
      message: "Subsidiary not found.",
    };
  }
  await subsidiary.destroy({ transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Subsidiary deleted successfully.",
  };
};

// ====== Deactivate / Activate Subsidiary
export const executeDeactivateSubsidiary = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const subsidiary = await Subsidiary.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!subsidiary) {
    return {
      success: false,
      statusCode: 404,
      message: "Subsidiary not found.",
    };
  }
  const newStatus = !subsidiary.is_active;
  await subsidiary.update({ is_active: newStatus }, { transaction });
  return {
    success: true,
    statusCode: 200,
    message: `Subsidiary ${newStatus ? 'activated' : 'deactivated'} successfully.`,
  };
};

export const executeAddBranch = async (
  data: any,
  user: any,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;

  const enrichedPayload = data.map((item: any) => ({
    ...item,
    organization_id,
  }));

  const branchNames = enrichedPayload.map((item: any) => item.branch_name);
  const subsidiaryIds = enrichedPayload.map((item: any) => item.subsidiary_id);

  const existingBranches = await branchService.findAll({
    where: {
      branch_name: branchNames,
      organization_id,
      subsidiary_id: subsidiaryIds,
    },
  });

  if (existingBranches.length > 0) {
    return {
      success: false,
      statusCode: 400,
      message: `Branch(es) with same name already exist}`,
    };
  }

  const savedRecords = await branchService.bulkCreate(enrichedPayload, {
    transaction,
  });

  return {
    success: true,
    statusCode: 200,
    message: "Subsidiary Branches Created Successfully!",
    data: savedRecords,
  };
};

export const executeGetBranches = async (
  requestData: any,
) => {
  let result;

  const { page, limit, organization_id, subsidiary_id } = requestData;
  const whereCondition: any = {
    organization_id: organization_id,
  };

  if (subsidiary_id) {
    whereCondition.subsidiary_id = subsidiary_id;
  }

  if (page && limit) {
    result = await branchService.paginate({
      page,
      limit,
      options: {
        where: whereCondition,
      },
    });
  } else {
    const branchesList = await branchService.findAll({
      where: whereCondition,
    });
    result = {
      data: branchesList,
      total: branchesList.length,
      pages: 1,
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Branch list fetched successfully",
    data: result,
  };
};
// Get Branch Detail
export const executeGetBranch = async (id: string) => {
  const branch = await SubsidiaryBranch.findOne({
    where: { id },
  });
  if (!branch) {
    return {
      success: false,
      statusCode: 404,
      message: "Branch not found",
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: "Branch data retrieved successfully",
    data: branch,
  };
}

// Update branch
export const executeUpdateBranch = async (
  id: string,
  data: any,
  user: any,
  transaction: Transaction
) => {
  const branch = await SubsidiaryBranch.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!branch) {
    return {
      success: false,
      statusCode: 400,
      message: "Branch doesn't exist",
    };
  }
  await SubsidiaryBranch.update(data, {
    where: { id: branch.id },
    transaction,
  });
  return {
    success: true,
    statusCode: 200,
    message: "Branches Updated Successfully!",
    data: branch,
  };
};

// ====== Deactivate / Activate Branch
export const executeDeactivateBranch = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const branchData = await SubsidiaryBranch.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!branchData) {
    return {
      success: false,
      statusCode: 404,
      message: "Branch not found.",
    };
  }
  const newStatus = !branchData.is_active;
  await branchData.update({ is_active: newStatus }, { transaction });
  return {
    success: true,
    statusCode: 200,
    message: `Branch ${newStatus ? 'activated' : 'deactivated'} successfully.`,
  };
};

// delete branch
export const executeDeleteBranch = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const branch = await SubsidiaryBranch.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!branch) {
    return {
      success: false,
      statusCode: 404,
      message: "Branch not found.",
    };
  }
  await branch.destroy({ transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Branch deleted successfully.",
  };
};




export const executeAddDepartment = async (
  data: any,
  user: any,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;
  const enrichedPayload = data.map((item: any) => ({
    ...item,
    organization_id,
  }));

  const department_name = enrichedPayload.map(
    (item: any) => item.department_name
  );
  const subsidiaryIds = enrichedPayload.map((item: any) => item.subsidiary_id);
  const branchIds = enrichedPayload.map(
    (item: any) => item.subsidiary_branch_id
  );

  const existingDepartment = await departmentService.findAll({
    where: {
      department_name: department_name,
      organization_id,
      subsidiary_id: subsidiaryIds,
      subsidiary_branch_id: branchIds,
    },
  });

  if (existingDepartment.length > 0) {
    return {
      success: false,
      statusCode: 400,
      message: `Department(s) with same name already exist}`,
    };
  }

  const savedRecords = await departmentService.bulkCreate(enrichedPayload, {
    transaction,
  });

  return {
    success: true,
    statusCode: 200,
    message: "Department Created Successfully!",
    data: savedRecords,
  };
};

export const executeGetDepartments = async (
  requestData: any,
) => {
  let result;

  const { page, limit, organization_id, subsidiary_id, subsidiary_branch_id } =
    requestData;
  const whereCondition: any = {
    organization_id: organization_id,
  };

  if (subsidiary_id) {
    whereCondition.subsidiary_id = subsidiary_id;
  }
  if (subsidiary_branch_id) {
    whereCondition.subsidiary_branch_id = subsidiary_branch_id;
  }

  const includeOptions: any = [
    {
      model: Subsidiary,
      as: "subsidiary",

    },
    {
      model: SubsidiaryBranch,
      as: "subsidiary_branch",

    },
  ];

  if (page && limit) {
    result = await departmentService.paginate({
      page,
      limit,
      options: {
        where: whereCondition,
        include: includeOptions,
      },
    });
  } else {
    const departmentList = await departmentService.findAll({
      where: whereCondition,
      include: includeOptions,
    });
    result = {
      data: departmentList,
      total: departmentList.length,
      pages: 1,
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Department list fetched successfully",
    data: result,
  };
};

export const executeGetDepartment = async (id: string, user: any) => {
  const department = await BranchDepartment.findOne({
    where: { id, organization_id: user.organization_id },
  });
  if (!department) {
    return {
      success: false,
      statusCode: 404,
      message: "Department not found",
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: "Department data retrieved successfully",
    data: department,
  };
};

export const executeUpdateDepartment = async (
  id: string,
  data: any,
  user: any,
  transaction: Transaction
) => {
  const department = await BranchDepartment.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!department) {
    return {
      success: false,
      statusCode: 400,
      message: "Department doesn't exist",
    };
  }
  await BranchDepartment.update(data, {
    where: { id: department.id },
    transaction,
  });
  return {
    success: true,
    statusCode: 200,
    message: "Departments Updated Successfully!",
    data: department,
  };
};

// ====== Deactivate / Activate Department
export const executeDeactivateDepartment = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const departmentData = await BranchDepartment.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!departmentData) {
    return {
      success: false,
      statusCode: 404,
      message: "Department not found.",
    };
  }
  const newStatus = !departmentData.is_active;
  await departmentData.update({ is_active: newStatus }, { transaction });
  return {
    success: true,
    statusCode: 200,
    message: `Department ${newStatus ? 'activated' : 'deactivated'} successfully.`,
  };
};

export const executeDeleteDepartment = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const department = await BranchDepartment.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!department) {
    return {
      success: false,
      statusCode: 404,
      message: "Department not found.",
    };
  }
  await department.destroy({ transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Department deleted successfully.",
  };
};