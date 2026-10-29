import { Op, QueryTypes, Transaction } from "sequelize";
import User from "../../models/User";
import OrgRole from "../../models/OrgRole";
import { RBT_VENDOR_QUEUES } from "../../../rabbitmq/Queues";
import { vendorEvents } from "../../../rabbitmq/Events";
import { publishToQueue } from "../../../rabbitmq/Producer";
import { generateUserIdNo } from "../../services/UserService";
import AppDataSource from "../../../config/DatabaseSource";
import Organization from "../../models/Organization";

export const executeInviteSuppliers = async (
  currentUser: any,
  payload: any[],
  transaction: Transaction
) => {
  const organization_id = currentUser.organization_id;

  // Step 1: Get Vendor Role
  const vendorRole = await OrgRole.findOne({
    where: {
      organization_id,
      role_name: "Vendor",
    },
    transaction,
  });

  if (!vendorRole) {
    return {
      success: false,
      statusCode: 400,
      message: "Vendor role not found for organization.",
    };
  }

  // Step 2: Find all users by email (existing vendors)
  const emails = payload.map((p) => p.contact_email);
  const existingUsers = await User.findAll({
    where: {
      email: { [Op.in]: emails },
      // organization_id,
      // user_type: "vendor",
    },
    transaction,
  });

  const userMap = new Map<string, any>();
  existingUsers.forEach((u) => userMap.set(u.email, u));

  const contactsToCreate: any[] = [];
  const infosToCreate: any[] = [];
  const usersToCreate: any[] = [];

  const newUserEmails = new Set<string>();

  for (const item of payload) {
    let user = userMap.get(item.contact_email);

    // If email already exists as admin
    if (user && user.user_type === "admin") {
      return {
        success: false,
        statusCode: 400,
        message: "This Email already exists as an admin",
      };
    }

    // Step 3: If user doesn't exist, prepare for bulkCreate
    if (!user) {
      const userIdNo = await generateUserIdNo("vendor", transaction);
      const newUser = {
        user_id_no: userIdNo,
        name: item.contact_name,
        email: item.contact_email,
        organization_id,
        org_role_id: vendorRole.id,
        user_type: "vendor",
        is_active: true,
        is_email_verified: true,
        created_by: currentUser.id,
      };
      usersToCreate.push(newUser);
    }
    newUserEmails.add(item.contact_email);
  }

  const organization = await Organization.findOne({
    where: { id: organization_id },
    transaction,
  });

  const organizationName = organization?.name || "";

  // Step 4: Bulk create new users and add to map
  if (usersToCreate.length) {
    const newUsers = await User.bulkCreate(usersToCreate, {
      transaction,
      returning: true,
    });
    newUsers.forEach((u) => userMap.set(u.email, u));
  }
  // Step 5: SupplierContact + SupplierInfo + Email payload
  const emailPayloads: { email: string; user_name: string; organization_name: string; }[] = [];

  // Step 5: Now create supplierContact + supplierInfo for all
  for (const item of payload) {
    const user = userMap.get(item.contact_email);

    // Prepare contact
    contactsToCreate.push({
      contact_name: item.contact_name,
      contact_email: item.contact_email,
      contact_phone: item.contact_phone,
      contact_phone_code: item.contact_phone_code || null,
      organization_id,
      user_id: user.id,
      is_primary: true,
    });

    // Prepare info
    infosToCreate.push({
      organization_id,
      user_id: user.id,
      certificate_of_incorporation: item.certificate_of_incorporation || false,
      tax_clearance_certificate: item.tax_clearance_certificate || false,
      vat_registration: item.vat_registration || false,
      audited_accounts: item.audited_accounts || false,
      financial_capability: item.financial_capability || false,
      banking_details: item.banking_details || false,
    });

    // Prepare email if newly created
    if (newUserEmails.has(item.contact_email)) {
      console.log(
        "push data to vendor emailPayloads :",
        user.email,
        user.name
      );
      emailPayloads.push({
        email: user.email,
        user_name: user.name,
        organization_name: organizationName,
      });
    }
  }

  await publishToQueue(RBT_VENDOR_QUEUES.VENDOR_INVITE_QUEUE, {
    event: vendorEvents.invite_suppliers,
    data: { contacts: contactsToCreate, infos: infosToCreate },
  });

  if (emailPayloads.length > 0) {
    console.log("emailPayloads vendor email invite :", emailPayloads);
    await publishToQueue(RBT_VENDOR_QUEUES.VENDOR_REGISTER_QUEUE, {
      event: vendorEvents.send_vendor_email,
      data: emailPayloads,
    });
  }

  return {
    success: true,
    statusCode: 200,
    message: `Suppliers invited successfully.`,
  };
};

export const executeGetSuppliers = async (
  user: any,
  filters: {
    status?: string;
    branch_id?: string;
    department_id?: string;
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    location?: string;
    rating?: string;
  }
) => {
  const {
    status,
    branch_id,
    department_id,
    page = 1,
    limit = 10,
    search,
    category,
    location,
    rating,
  } = filters;

  const offset = (page - 1) * limit;

  const whereCondition: any = {
    organization_id: user.organization_id,
    user_type: "vendor",
  };

  // ✅ Status
  if (status) {
    if (status === "pending") {
      whereCondition.supplier_status = null;
    } else {
      whereCondition.supplier_status = status;
    }
  }

  // ✅ Branch
  if (branch_id) {
    whereCondition.subsidiary_branch_id = branch_id;
  }

  // ✅ Department
  if (department_id) {
    whereCondition.branch_department_id = department_id;
  }

  // ✅ Search (name LIKE %search%)
  if (search) {
    whereCondition.name = {
      [Op.iLike]: `%${search}%`, // use Op.like if not Postgres
    };
  }

  if (category) {
    whereCondition.supplier_approval_type = category;
  }

  if (location) {
    whereCondition.country = location;
  }

  if (rating) {
    const supplierIds: any[] = await AppDataSource.query(
      `
    SELECT supplier_user_id
    FROM supplier_ratings
    GROUP BY supplier_user_id
    HAVING AVG(overall_rating) >= :rating
       AND AVG(overall_rating) < (:rating + 1)
    `,
      {
        replacements: { rating: Number(rating) },
        type: QueryTypes.SELECT,
      }
    );

    if (!supplierIds.length) {
      return {
        statusCode: 200,
        message: "No suppliers found.",
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          previous: null,
          next: null,
        },
      };
    }

    whereCondition.id = {
      [Op.in]: supplierIds.map((i: any) => i.supplier_user_id),
    };
  }

  const { count, rows } = await User.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "name"],
      },
    ],
  });

  const totalPages = Math.ceil(count / limit);

  return {
    statusCode: 200,
    message: "Suppliers fetched successfully.",
    data: rows,
    meta: {
      total: count,
      page,
      limit,
      totalPages,
      previous: page > 1 ? page - 1 : null,
      next: page < totalPages ? page + 1 : null,
    },
  };
};

export const executeGetSupplierFilterOptions = async (user: any) => {
  const rows = await User.findAll({
    where: {
      organization_id: user.organization_id,
      user_type: "vendor",
    },
    attributes: ["country", "supplier_approval_type"],
  });

  const locations = new Set<string>();
  const categories = new Set<string>();

  for (const row of rows) {
    if (row.country) locations.add(row.country);
    if (row.supplier_approval_type) categories.add(row.supplier_approval_type);
  }

  return {
    locations: Array.from(locations),
    categories: Array.from(categories),
  };
};

export const executeGetSupplierById = async (user: any, supplierId: string) => {

  try {
    /* -----------------------------------------------------------
       1. CHECK SUPPLIER (users table)
    ------------------------------------------------------------*/
    const supplier = await AppDataSource.query(
      `
      SELECT *
      FROM users
      WHERE id = :supplierId
      AND organization_id = :organizationId
      AND user_type = 'vendor'
      AND is_active = true
      `,
      {
        replacements: {
          supplierId,
          organizationId: user.organization_id,
        },
        type: QueryTypes.SELECT,
      }
    );

    if (!supplier.length) {
      return {
        success: false,
        statusCode: 404,
        message: "Supplier not found.",
      };
    }

    /* -----------------------------------------------------------
       2. SUPPLIER INFO
    ------------------------------------------------------------*/
    const supplierInfo = await AppDataSource.query(
      `
      SELECT *
      FROM supplier_infos
      WHERE user_id = :supplierId
      `,
      {
        replacements: { supplierId },
        type: QueryTypes.SELECT,
      }
    );

    /* -----------------------------------------------------------
       3. SUPPLIER CONTACTS
    ------------------------------------------------------------*/
    const supplierContacts = await AppDataSource.query(
      `
      SELECT *
      FROM supplier_contacts
      WHERE user_id = :supplierId
      `,
      {
        replacements: { supplierId },
        type: QueryTypes.SELECT,
      }
    );

    /* -----------------------------------------------------------
       4. ORGANIZATION DATA
    ------------------------------------------------------------*/
    const organization = await AppDataSource.query(
      `
      SELECT o.*
      FROM organizations o
      JOIN supplier_infos s ON s.organization_id = o.id
      WHERE s.user_id = :supplierId
      `,
      {
        replacements: { supplierId },
        type: QueryTypes.SELECT,
      }
    );

    /* -----------------------------------------------------------
       5. ORDER STATISTICS
    ------------------------------------------------------------*/
    const orderStats = await AppDataSource.query(
      `
      SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN supplier_status='delivered' THEN total_order_amount ELSE 0 END) AS completed_po,
        SUM(CASE WHEN supplier_status='pending' THEN total_order_amount ELSE 0 END) AS pending_po,
        SUM(
          CASE 
            WHEN invoice_supplier_status IN ('fully_invoiced_paid','partially_invoiced_paid')
            THEN total_order_amount
            ELSE 0
          END
        ) AS invoices
      FROM orders
      WHERE selected_supplier_id = :supplierId
      `,
      {
        replacements: { supplierId },
        type: QueryTypes.SELECT,
      }
    );

    /* -----------------------------------------------------------
       6. ORDER ITEMS + PRODUCT DETAILS
    ------------------------------------------------------------*/
    const orderItems = await AppDataSource.query(
      `
      SELECT osi.*
      FROM order_supplier_items osi
      JOIN orders o ON o.id = osi.order_id
      WHERE o.selected_supplier_id = :supplierId
      `,
      {
        replacements: { supplierId },
        type: QueryTypes.SELECT,
      }
    );

    /* -----------------------------------------------------------
       7. CONTRACTS
    ------------------------------------------------------------*/
    const contracts = await AppDataSource.query(
      `
      SELECT *
      FROM contracts
      WHERE 
      (author_id = :supplierId AND counter_party_id = :userId)
      OR
      (author_id = :userId AND counter_party_id = :supplierId)
      `,
      {
        replacements: {
          supplierId: supplierId,
          userId: user.id,
        },
        type: QueryTypes.SELECT,
      }
    );

    /* -----------------------------------------------------------
       8. SUPPLIER PERFORMANCE RATINGS (AVERAGES)
    ------------------------------------------------------------*/
    const ratings = await AppDataSource.query(
      `
      SELECT
        AVG(quality_item_rating) AS quality_item_rating,
        AVG(fullfill_order_rating) AS fullfill_order_rating,
        AVG(overall_rating) AS overall_rating,
        AVG(resolving_complaint_rating) AS resolving_complaint_rating,
        AVG(communication_rating) AS communication_rating
      FROM supplier_ratings
      WHERE supplier_user_id = :supplierId
      `,
      {
        replacements: { supplierId },
        type: QueryTypes.SELECT,
      }
    );

    /* -----------------------------------------------------------
       9. DELIVERY PERFORMANCE
    ------------------------------------------------------------*/
    const deliveryPerformance = await AppDataSource.query(
      `
     SELECT
  TO_TIMESTAMP(AVG(EXTRACT(EPOCH FROM q.expected_delivery_date))) AS avg_expected_delivery_date,
  TO_TIMESTAMP(AVG(EXTRACT(EPOCH FROM o.supplier_delivery_date))) AS avg_supplier_delivery_date
FROM quotations q
JOIN orders o 
  ON o.selected_supplier_id = q.selected_supplier_id
WHERE q.selected_supplier_id = :supplierId
      `,
      {
        replacements: { supplierId },
        type: QueryTypes.SELECT,
      }
    );

    /* -----------------------------------------------------------
       10. DOCUMENTS
    ------------------------------------------------------------*/
    const documents = await AppDataSource.query(
      `
      SELECT *
      FROM supplier_documents
      WHERE user_id = :supplierId
      `,
      {
        replacements: { supplierId },
        type: QueryTypes.SELECT,
      }
    );

    /* -----------------------------------------------------------
       11. BANK INFO
    ------------------------------------------------------------*/
    const bankInfo = await AppDataSource.query(
      `
      SELECT *
      FROM supplier_bank_infos
      WHERE user_id = :supplierId
      `,
      {
        replacements: { supplierId },
        type: QueryTypes.SELECT,
      }
    );

    return {
      success: true,
      statusCode: 200,
      message: "Supplier fetched successfully.",
      data: {
        supplier: supplier[0],
        supplierInfo: supplierInfo[0] || null,
        supplierContacts,
        organization: organization[0] || null,
        orders: orderStats[0] || {},
        orderItems,
        contracts,
        performance: ratings[0] || {},
        deliveryPerformance: deliveryPerformance[0] || {},
        documents,
        bankInfo,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const updateSupplierStatusService = async (supplierId: string, body: any) => {
  const { is_active, supplier_approval_type } = body;

  if (is_active === undefined && !supplier_approval_type) {
    return {
      success: false,
      statusCode: 400,
      message: "Provide is_active or supplier_approval_type.",
    };
  }

  const supplier = await User.findByPk(supplierId);

  if (!supplier) {
    return {
      success: false,
      statusCode: 404,
      message: "Supplier not found.",
    };
  }

  const updateData: any = {};

  if (is_active !== undefined) updateData.is_active = is_active;
  if (supplier_approval_type) updateData.supplier_approval_type = supplier_approval_type;

  await supplier.update(updateData);

  return {
    success: true,
    statusCode: 200,
    message: "Supplier updated successfully.",
    data: supplier,
  };
};
