import { Op, Transaction, QueryTypes, Sequelize } from "sequelize";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import OrgItem from "../models/OrgItem";
import sequelize from "../../config/DatabaseSource";
import OrgItemLocation from "../models/OrgItemLocation";
import OrgItemImage from "../models/OrgItemImage";
import { resolveOrgInventoryRelations } from "../services/OrgInventoryGrpcService";
dayjs.extend(isBetween);

export const executeAddProduct = async (
  payload: any,
  user: any,
  transaction: Transaction
) => {
  const { locations, images, ...updatedPayload } = payload;

  if (updatedPayload.sku) {
    console.log(`
============================================================
🔍 SKU CHECK START
============================================================
Incoming SKU: ${updatedPayload.sku}
============================================================
`);

    const isSkuExist = await OrgItem.findOne({
      where: { sku: updatedPayload.sku },
    });

    console.log("SKU FOUND IN DB:", isSkuExist ? "YES ❌ DUPLICATE" : "NO ✅ UNIQUE");

    if (isSkuExist) {
      console.log(`
============================================================
🚨 DUPLICATE SKU DETECTED
============================================================
SKU: ${updatedPayload.sku}
Existing Product ID: ${isSkuExist.id}
============================================================
`);

      return {
        success: false,
        statusCode: 409,
        message: "Duplicate SKU",
      };
    }
  }

  const organization_id = user.organization_id;
  const user_id = user.id;

  let newProduct: any;

  try {
    newProduct = await OrgItem.create(
      {
        ...updatedPayload,
        is_active: updatedPayload.is_active ?? true,
        organization_id,
        user_id,
      },
      { transaction }
    );
  } catch (err: any) {
    console.log(`
============================================================
💥 DB ERROR DURING CREATE
============================================================
Error Name: ${err.name}
Error Message: ${err.message}
============================================================
`);

    if (err.name === "SequelizeUniqueConstraintError") {
      console.log(`
============================================================
🚨 DUPLICATE SKU FROM DB CONSTRAINT
============================================================
SKU: ${updatedPayload.sku}
============================================================
`);

      return {
        success: false,
        statusCode: 409,
        message: "SKU already exists",
      };
    }

    throw err;
  }

  const inventoryId = newProduct.id;
  let locationsData;
  if (locations && locations.length > 0) {
    const locationData = locations.map((location: any) => ({
      ...location,
      org_item_id: inventoryId,
    }));
    locationsData = await OrgItemLocation.bulkCreate(locationData, {
      transaction,
    });
  }
  let imagesData;
  if (images && images.length > 0) {
    const imageData = images.map((image: any) => ({
      ...image,
      org_item_id: inventoryId,
    }));

    imagesData = await OrgItemImage.bulkCreate(imageData, { transaction });
  }

  return {
    success: true,
    statusCode: 201,
    message: "Organization product created successfully",
    data: {
      product: newProduct,
      images: imagesData,
      locations: locationsData,
    },
  };
};

export const executeAddBulkProducts = async (
  payload: any[],
  user: any,
  transaction: Transaction
) => {
  const organization_id = user.organization_id;
  const user_id = user.id;

  const createdProducts: any[] = [];

  for (const item of payload) {
    const { locations, images, ...updatedPayload } = item;

    if (updatedPayload.sku) {
      const isSkuExist = await OrgItem.findOne({
        where: { sku: updatedPayload.sku },
      });

      if (isSkuExist) {
        return {
          success: false,
          statusCode: 400,
          message: `Duplicate SKU: ${updatedPayload.sku}`,
        };
      }
    }

    const newProduct: any = await OrgItem.create(
      {
        ...updatedPayload,
        is_active: true,
        organization_id,
        user_id,
      },
      { transaction }
    );

    const inventoryId = newProduct.id;

    let locationsData;
    if (locations && locations.length > 0) {
      const locationData = locations.map((location: any) => ({
        ...location,
        org_item_id: inventoryId,
      }));

      locationsData = await OrgItemLocation.bulkCreate(locationData, {
        transaction,
      });
    }

    let imagesData;
    if (images && images.length > 0) {
      const imageData = images.map((image: any) => ({
        ...image,
        org_item_id: inventoryId,
      }));

      imagesData = await OrgItemImage.bulkCreate(imageData, {
        transaction,
      });
    }

    createdProducts.push({
      product: newProduct,
      images: imagesData,
      locations: locationsData,
    });
  }

  return {
    success: true,
    statusCode: 201,
    message: "Organization products created successfully",
    data: createdProducts,
  };
};

// === executeGetProducts
// export const executeGetProducts = async (payload: any) => {
//   console.log("payload", payload);
//   const { page, limit, subsidiary_id, organization_id, search, is_active, branch_id, department_id } = payload;
//   try {
//     const whereCondition: any = {
//       organization_id,
//     };
//     if (subsidiary_id) {
//       whereCondition.subsidiary_id = subsidiary_id;
//     }
//     if (is_active !== undefined) {
//       whereCondition.is_active = is_active;
//     }

//     if (search) {
//       whereCondition[Op.or] = [
//         { item_name: { [Op.iLike]: `%${search}%` } },
//         { item_description: { [Op.iLike]: `%${search}%` } },
//         { sku: { [Op.iLike]: `%${search}%` } },
//         sequelize.where(
//           Sequelize.cast(Sequelize.col("type"), "TEXT"),
//           { [Op.iLike]: `%${search}%` }
//         ),
//         Sequelize.where(
//           Sequelize.cast(Sequelize.col("estimated_stock_price"), "TEXT"),
//           { [Op.iLike]: `%${search}%` }
//         ),
//       ];
//     }

//     if (!page && !limit) {
//       const inventories: any = await OrgItem.findAll({
//         where: whereCondition,
//         include: [
//           {
//             model: OrgItemLocation,
//             as: "locations",
//             where: branch_id ? { subsidiary_branch_id: branch_id } : undefined,
//             required: branch_id ? true : false
//           },
//           {
//             model: OrgItemImage,
//             as: "images",
//           },
//         ],
//         order: [["created_at", "DESC"]],
//       });
//       const enrichedData = [];

//       for (const inventory of inventories) {

//         const enriched = await resolveOrgInventoryRelations(inventory);
//         const plainInventory = inventory.toJSON();

//         let departments: any[] = [];

//         if (plainInventory.locations?.length) {

//           const branchIds = plainInventory.locations.map(
//             (l: any) => l.subsidiary_branch_id
//           );

//           const departmentRows: any = await sequelize.query(
//             `
//       SELECT id, department_name, subsidiary_branch_id
//       FROM branch_departments
//       WHERE subsidiary_branch_id IN (:branchIds)
//       `,
//             {
//               replacements: { branchIds },
//               type: QueryTypes.SELECT
//             }
//           );

//           departments = departmentRows;

//           if (department_id) {
//             const match = departmentRows.find(
//               (d: any) => d.id === department_id
//             );

//             if (!match) {
//               continue;
//             }
//           }
//         }

//         enrichedData.push({
//           ...plainInventory,
//           category: enriched.org_category,
//           branch: enriched.org_subsidiary_branch,
//           departments,
//         });
//       }
//       return {
//         success: true,
//         statusCode: 200,
//         message: "Organization Products fetched successfully",
//         data: enrichedData || [],
//       };
//     }

//     const currentPage = parseInt(page) || 1;
//     const currentLimit = parseInt(limit) || 10;
//     const offset = (currentPage - 1) * currentLimit;

//     const { count: totalCount, rows: inventoriesData } =
//       await OrgItem.findAndCountAll({
//         where: whereCondition,
//         include: [
//           {
//             model: OrgItemLocation,
//             as: "locations",
//           },
//           {
//             model: OrgItemImage,
//             as: "images",
//           },
//         ],
//         limit: currentLimit,
//         offset,
//         order: [["created_at", "DESC"]],
//       });
//     const enrichedData = [];
//     for (const inventory of inventoriesData) {
//       const enriched = await resolveOrgInventoryRelations(inventory);
//       const plainInventory = inventory.toJSON ? inventory.toJSON() : inventory;

//       enrichedData.push({
//         ...plainInventory,
//         category: enriched.org_category,
//         branch: enriched.org_subsidiary_branch,
//       });
//     }

//     const totalPages = Math.ceil(totalCount / currentLimit);

//     return {
//       success: true,
//       statusCode: 200,
//       message: "Organization Products fetched successfully",
//       data: {
//         inventories: enrichedData || [],
//         pagination: {
//           currentPage,
//           totalPages,
//           totalCount,
//           hasNextPage: currentPage < totalPages,
//           hasPrevPage: currentPage > 1,
//         },
//         summary: {
//           total_stock_items: totalCount,
//           low_stock_alert: 2,
//           stock_movements: 0,
//         },
//       },
//     };
//   } catch (err: any) {
//     console.log(err);
//     return {
//       success: false,
//       statusCode: 500,
//       message: "Internal Server Error",
//       error: err?.original?.message || err?.message,
//     };
//   }
// };

export const executeGetProducts = async (payload: any) => {
  const {
    page,
    limit,
    subsidiary_id,
    organization_id,
    search,
    is_active,
    branch_id,
    department_id,
    type,
    min_stock,
    max_stock,
    category,
  } = payload;

  try {
    const whereCondition: any = { organization_id };

    if (subsidiary_id) whereCondition.subsidiary_id = subsidiary_id;
    if (is_active !== undefined) whereCondition.is_active = is_active;
    if (type) whereCondition.type = type;
    if (category) { whereCondition.org_category_id = category };
    if (min_stock !== undefined || max_stock !== undefined) {
      whereCondition.total_stock = {};

      if (min_stock !== undefined) {
        whereCondition.total_stock[Op.gte] = min_stock;
      }

      if (max_stock !== undefined) {
        whereCondition.total_stock[Op.lte] = max_stock;
      }
    }


    if (search) {
      whereCondition[Op.or] = [
        { item_name: { [Op.iLike]: `%${search}%` } },
        { item_description: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        sequelize.where(
          Sequelize.cast(Sequelize.col("type"), "TEXT"),
          { [Op.iLike]: `%${search}%` }
        ),
      ];
    }

    /* -----------------------------------------------------------
       FETCH ALL DATA (NO LIMIT)
    ------------------------------------------------------------*/
    const inventories: any = await OrgItem.findAll({
      where: whereCondition,
      include: [
        {
          model: OrgItemLocation,
          as: "locations",
          where: branch_id
            ? { subsidiary_branch_id: branch_id }
            : undefined,
          required: !!branch_id,
        },
        {
          model: OrgItemImage,
          as: "images",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    /* -----------------------------------------------------------
       FILTER + ENRICH
    ------------------------------------------------------------*/
    const filteredData: any[] = [];

    for (const inventory of inventories) {
      const enriched = await resolveOrgInventoryRelations(inventory);
      const plain = inventory.toJSON();

      let departments: any[] = [];
      let matchDepartment = false;

      // ✅ DEPARTMENT FILTER
      if (plain.locations?.length) {
        const branchIds = plain.locations.map(
          (l: any) => l.subsidiary_branch_id
        );

        const departmentRows: any = await sequelize.query(
          `
          SELECT id, department_name, subsidiary_branch_id
          FROM branch_departments
          WHERE subsidiary_branch_id IN (:branchIds)
          `,
          {
            replacements: { branchIds },
            type: QueryTypes.SELECT,
          }
        );

        departments = departmentRows;

        if (department_id) {
          matchDepartment = departmentRows.some(
            (d: any) => d.id === department_id
          );
        }
      }

      if (department_id && !matchDepartment) continue;

      const itemData = {
        ...plain,
        category: enriched.org_category,
        branch: enriched.org_subsidiary_branch,
        departments,
      };

      filteredData.push(itemData);
    }

    /* -----------------------------------------------------------
       PAGINATION (AFTER FILTER)
    ------------------------------------------------------------*/
    const currentPage = parseInt(page) || 1;
    const currentLimit = parseInt(limit) || 10;

    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / currentLimit);

    const offset = (currentPage - 1) * currentLimit;

    const paginatedData = filteredData.slice(
      offset,
      offset + currentLimit
    );

    /* -----------------------------------------------------------
       SUMMARY
    ------------------------------------------------------------*/
    const startOfMonth = dayjs().startOf("month");
    const endOfMonth = dayjs().endOf("month");

    const lastMonthStart = dayjs().subtract(1, "month").startOf("month");
    const lastMonthEnd = dayjs().subtract(1, "month").endOf("month");

    const compare = (current: number, previous: number) => {
      const percentage =
        previous === 0
          ? current > 0
            ? 100
            : 0
          : Number((((current - previous) / previous) * 100).toFixed(2));

      const trend =
        current > previous ? "up" : current < previous ? "down" : "same";

      return { current, previous, percentage, trend };
    };

    const currentMonthCount = filteredData.filter((item: any) =>
      dayjs(item.updated_at).isBetween(startOfMonth, endOfMonth, null, "[]")
    ).length;

    const lastMonthCount = filteredData.filter((item: any) =>
      dayjs(item.updated_at).isBetween(
        lastMonthStart,
        lastMonthEnd,
        null,
        "[]"
      )
    ).length;

    const currentLowStock = filteredData.filter(
      (i: any) => i.stock_quantity <= 2
    ).length;

    const summary = {
      total_stock_items: compare(currentMonthCount, lastMonthCount),
      low_stock_alert: compare(currentLowStock, 0),
      stock_movements: compare(currentMonthCount, lastMonthCount),
    };

    return {
      success: true,
      statusCode: 200,
      message: "Organization Products fetched successfully",
      data: {
        inventories: paginatedData,
        pagination: {
          currentPage,
          totalPages,
          totalCount,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
        summary,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
      error: err?.original?.message || err?.message,
    };
  }
};

// Get Product Detail

export const executeGetProduct = async (
  id: string,
  organization_id: string
) => {
  const inventoryDetail = await OrgItem.findOne({
    where: { id, organization_id },
    include: [
      {
        model: OrgItemLocation,
        as: "locations",
      },
      {
        model: OrgItemImage,
        as: "images",
      },
    ],
  });
  if (!inventoryDetail) {
    return {
      success: false,
      statusCode: 404,
      message: "Product not found",
    };
  }
  const enriched = await resolveOrgInventoryRelations(inventoryDetail);

  return {
    success: true,
    statusCode: 200,
    message: "Product data retrieved successfully",
    data: enriched,
  };
};

// delete Product
export const executeDeleteProduct = async (
  id: string,
  organization_id: string,
  transaction: Transaction
) => {
  const inventory = await OrgItem.findOne({
    where: { id, organization_id },
    transaction,
  });
  if (!inventory) {
    return {
      success: false,
      statusCode: 404,
      message: "Product not found.",
    };
  }
  await inventory.destroy({ transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Product deleted successfully.",
  };
};

// ====== Deactivate / Activate Product
export const executeDeactivateProduct = async (
  id: string,
  organization_id: string,
  transaction: Transaction
) => {
  const inventoryData = await OrgItem.findOne({
    where: { id, organization_id },
    transaction,
  });
  if (!inventoryData) {
    return {
      success: false,
      statusCode: 404,
      message: "Product not found.",
    };
  }
  const newStatus = !inventoryData.is_active;
  await inventoryData.update({ is_active: newStatus }, { transaction });
  return {
    success: true,
    statusCode: 200,
    message: `Product ${newStatus ? "activated" : "deactivated"} successfully.`,
  };
};

// ====== Update Product
export const executeUpdateProduct = async (
  productId: string,
  payload: any,
  user: any,
  transaction: Transaction
) => {
  const { locations, images, ...updatedPayload } = payload;
  const existingProduct = await OrgItem.findOne({
    where: {
      id: productId,
      organization_id: user.organization_id,
    },
  });

  if (!existingProduct) {
    return {
      success: false,
      statusCode: 404,
      message: "Product not found",
    };
  }
  if (updatedPayload.sku && updatedPayload.sku !== existingProduct.sku) {
    const isSkuExist = await OrgItem.findOne({
      where: {
        sku: updatedPayload.sku,
        id: { [Op.ne]: productId },
      },
    });
    if (isSkuExist) {
      return {
        success: false,
        statusCode: 409,
        message: "Duplicate SKU",
      };
    }
  }

  await OrgItem.update(
    {
      ...updatedPayload,
      user_id: user.id,
    },
    {
      where: { id: productId },
      transaction,
    }
  );

  if (locations !== undefined) {
    const payloadLocationIds = locations
      .filter((location: any) => location.id)
      .map((location: any) => location.id);
    await OrgItemLocation.destroy({
      where: {
        org_item_id: productId,
        ...(payloadLocationIds.length > 0 && {
          id: { [Op.notIn]: payloadLocationIds },
        }),
      },
      transaction,
    });
    let allLocationData;
    const locationPromises = locations.map(async (location: any) => {
      const locationData = {
        ...location,
        org_item_id: productId,
      };

      if (location.id) {
        await OrgItemLocation.update(locationData, {
          where: {
            id: location.id,
            org_item_id: productId,
          },
          transaction,
        });
        return { ...locationData, id: location.id };
      } else {
        const newLocation = await OrgItemLocation.create(locationData, {
          transaction,
        });
        return newLocation.toJSON();
      }
    });

    allLocationData = await Promise.all(locationPromises);
  }

  let imagesData;
  if (images !== undefined) {
    const payloadImageIds = images
      .filter((image: any) => image.id)
      .map((image: any) => image.id);

    await OrgItemImage.destroy({
      where: {
        org_item_id: productId,
        ...(payloadImageIds.length > 0 && {
          id: { [Op.notIn]: payloadImageIds },
        }),
      },
      transaction,
    });

    const imagePromises = images.map(async (image: any) => {
      const imageData = {
        ...image,
        org_item_id: productId,
      };

      if (image.id) {
        await OrgItemImage.update(imageData, {
          where: {
            id: image.id,
            org_item_id: productId,
          },
          transaction,
        });
        return { ...imageData, id: image.id };
      } else {
        const newImage = await OrgItemImage.create(imageData, { transaction });
        return newImage.toJSON();
      }
    });

    imagesData = await Promise.all(imagePromises);
  }

  const finalProduct = await OrgItem.findOne({
    where: { id: productId },
    include: [
      {
        model: OrgItemLocation,
        as: "locations",
      },
      {
        model: OrgItemImage,
        as: "images",
      },
    ],
    transaction,
  });

  return {
    success: true,
    statusCode: 200,
    message: "Organization product updated successfully",
    data: finalProduct,
  };
};
// ====== Move Inventory Location
// export const executeUpdateInventoryLocation = async (
//   locationId: string,
//   payload: any,
//   user: any,
//   transaction: Transaction
// ) => {
//   const existingLocation = await OrgItemLocation.findOne({
//     where: {
//       id: locationId,
//     },
//   });

//   if (!existingLocation) {
//     return {
//       success: false,
//       statusCode: 404,
//       message: "Location not found",
//     };
//   }

//   await OrgItemLocation.update(
//     {
//       ...payload,
//     },
//     {
//       where: { id: locationId },
//       transaction,
//     }
//   );

//   return {
//     success: true,
//     statusCode: 200,
//     message: "Inventory Moved from one location to another successfully!",
//   };
// };

export const executeUpdateInventoryLocation = async (
  payload: any,
  transaction: Transaction
) => {
  const { locations } = payload; // expecting 2 objects

  for (const loc of locations) {
    const existing = await OrgItemLocation.findOne({
      where: { id: loc.id },
    });

    if (!existing) {
      return {
        success: false,
        statusCode: 404,
        message: `Location not found for id ${loc.id}`,
      };
    }

    await OrgItemLocation.update(
      {
        ...(loc.location !== undefined && { location: loc.location }),
        ...(loc.current_stock_quantity !== undefined && {
          current_stock_quantity: loc.current_stock_quantity,
        }),
      },
      {
        where: { id: loc.id },
        transaction,
      }
    );
  }

  return {
    success: true,
    statusCode: 200,
    message: "Inventory moved successfully",
  };
};

// get category against organization
export const executeGetOrgCategories = async (payload: any) => {
  const { organization_id } = payload;

  try {
    // Fetch categories for the organization
    const categories = await sequelize.query(
      `
      SELECT id, category_name, created_at, updated_at
      FROM org_categories
      WHERE organization_id = :organizationId
      ORDER BY created_at DESC
      `,
      {
        replacements: { organizationId: organization_id },
        type: QueryTypes.SELECT,
      }
    );

    // Trend calculation
    const startOfMonth = dayjs().startOf("month");
    const endOfMonth = dayjs().endOf("month");
    const lastMonthStart = dayjs().subtract(1, "month").startOf("month");
    const lastMonthEnd = dayjs().subtract(1, "month").endOf("month");

    const compare = (current: number, previous: number) => {
      const percentage =
        previous === 0 ? (current > 0 ? 100 : 0) : Number((((current - previous) / previous) * 100).toFixed(2));
      const trend = current > previous ? "up" : current < previous ? "down" : "same";
      return { current, previous, percentage, trend };
    };

    const currentMonthCount = categories.filter((c: any) =>
      dayjs(c.updated_at).isBetween(startOfMonth, endOfMonth, null, "[]")
    ).length;

    const lastMonthCount = categories.filter((c: any) =>
      dayjs(c.updated_at).isBetween(lastMonthStart, lastMonthEnd, null, "[]")
    ).length;

    const summary = {
      total_categories: compare(currentMonthCount, lastMonthCount),
    };

    return {
      success: true,
      statusCode: 200,
      message: "Organization categories fetched successfully",
      data: {
        categories,
        summary,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
      error: err?.original?.message || err?.message,
    };
  }
};
