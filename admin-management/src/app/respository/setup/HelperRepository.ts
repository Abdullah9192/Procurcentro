import AppDataSource from "../../../config/DatabaseSource";
import BranchDepartment from "../../models/BranchDepartment";
import SubsidiaryBranch from "../../models/SubsidiaryBranch";

export const executeGetBranchesAndDepartments = async (
  organization_id: string
) => {
  const transaction = await AppDataSource.transaction();

  try {
    const branches = await SubsidiaryBranch.findAll({
      where: { organization_id },
      attributes: ["branch_name"],
      transaction,
    });

    const departments = await BranchDepartment.findAll({
      where: { organization_id },
      attributes: ["department_name"],
      transaction,
    });

    await transaction.commit();

    return {
      success: true,
      statusCode: 200,
      message: "Branches and Departments fetched successfully.",
      data: {
        branches: branches.map((b: any) => ({
          branch_name: b.branch_name,
        })),
        departments: departments.map((d: any) => ({
          department_name: d.department_name,
        })),
      },
    };
  } catch (err) {
    await transaction.rollback();

    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch branches and departments.",
      error: err,
    };
  }
};
