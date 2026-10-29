import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../utils/general/JwtUtils";
import AppDataSource from "../../../../config/DatabaseSource";
import User from "../../../models/User";
import OrgRole from "../../../models/OrgRole";
import OrgRoleModulePermission from "../../../models/OrgRoleModulePermission";
import Module from "../../../models/Module";
import Organization from "../../../models/Organization";
import { orgCategoryService } from "../../../../grpc/services/AdminGrpcService";

export const handleRegisterEmployee = async (req: Request, res: Response) => {
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

export const handleEmployeeLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { email },
      include: [
        { model: Organization, as: "organization" },
        {
          model: OrgRole,
          as: "org_role",
          include: [
            {
              model: OrgRoleModulePermission,
              as: "org_role_module_permissions",
              include: [
                {
                  model: Module,
                  as: "module",
                },
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      res.status(400).json({ message: "Invalid email." });
      return;
    }

    if ((user.login_count ?? 0) >= 5) {
      res.status(423).json({
        message: "Account locked. Try again later.",
      });
      return;
    }

    if (user.user_type !== "employee") {
      res.status(400).json({
        message: "Permission denied , You are not enrolled as a employee",
      });
      return;
    }

    if (!user.is_email_verified) {
      res
        .status(400)
        .json({ message: "Please verify your email before logging in." });
      return;
    }
    if (!user.is_active) {
      res.status(400).json({
        message:
          "Your account is currently inactive. Please contact support for assistance.",
      });
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await user.increment("login_count", { by: 1 });
      res.status(400).json({ message: "Invalid password." });
      return;
    }

    if ((user.login_count ?? 0) > 0) {
      await user.update({ login_count: 0 });
    }
    
    const token = await generateToken({
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      organization_id: user.organization_id,
      org_role_id: user.org_role_id,
      user_role: user.org_role?.role_name,
      user_type: user.user_type,
    });
    const { password: _, ...userData } = user.get({ plain: true });
    // ✅ Extract flat module permissions array
    const permissions =
      user.org_role?.org_role_module_permissions?.map(
        (p: any) => p.module?.name
      ) || [];

    res.status(200).json({
      token,
      permissions, // ⬅️ clean array for frontend
      organization: user.organization,
      user: {
        ...userData,
        role_name: user.org_role?.role_name,
      },
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : error,
    });
    return;
  }
};
