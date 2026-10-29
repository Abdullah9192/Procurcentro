import { Op, QueryTypes, Transaction } from "sequelize";
import * as XLSX from "xlsx";
import { getOrganizationById } from "../../../grpc/clients/OrganizationClient";
import { BaseService } from "../../services/BaseService";
import SupplierItem from "../../models/SupplierCatalogue";
import SupplierItemImage from "../../models/SupplierCatalogueImage";
import SupplierIndustry from "../../models/SupplierIndustry";
import { getOrgCategoryById } from "../../../grpc/clients/AdminGrpcClient";
import { supplierCatalogueValidation } from "../../v1/validators/CatalogueValidation";
import AppDataSource from "../../../config/DatabaseSource";

export const supplierCatalogueService = new BaseService(SupplierItem);
export const supplierCatalogueImageService = new BaseService(SupplierItemImage);

export const executeCreateSupplierCatalogue = async (
  data: any,
  user: any,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;
  const user_id = user?.id;

  const organizationResponse = await getOrganizationById(organization_id);

  if (!organizationResponse || !organizationResponse.id) {
    return {
      success: false,
      statusCode: 404,
      message: "Organization not found",
    };
  }
  if (data.sku) {
    const existingSku = await supplierCatalogueService.findOne({
      where: {
        sku: data.sku,
      },
    });

    if (existingSku) {
      return {
        success: false,
        statusCode: 409,
        message: "SKU already exists",
      };
    }
  }
  const catalogueData = {
    organization_id,
    user_id,
    item_name: data.item_name,
    item_description: data.item_description || null,
    supplier_category_id: data.supplier_category_id,
    brand_name: data.brand_name || null,
    sku: data.sku || null,
    stock_price: data.stock_price,
    estimated_shipping_price: data.estimated_shipping_price,
    estimated_tax: data.estimated_tax,
    estimated_total_price: data.estimated_total_price,
    dimensions: data.dimensions,
    weight: data.weight,
    type: data.type || "item",
    is_active: data.is_active !== undefined ? data.is_active : true,
    unit: data.unit || "piece",
    locations: data.locations?.map((location: any) => ({
      subsidiary_branch_id: location.subsidiary_branch_id,
      current_stock_quantity: location.current_stock_quantity,
    })) || [],
  };

  const catalogue = await supplierCatalogueService.create(catalogueData, {
    transaction,
  });

  if (data.images && data.images.length > 0) {
    const imageData = data.images.map((image: any) => ({
      supplier_catalogue_id: catalogue.id,
      file_url: image.file_url,
    }));

    await supplierCatalogueImageService.bulkCreate(imageData, { transaction });
  }

  const completeCatalogue = await supplierCatalogueService.findById(
    catalogue.id,
    {
      include: [
        {
          model: SupplierItemImage,
          as: "supplierCatalogueImages",
        },
      ],
      transaction,
    }
  );

  return {
    success: true,
    statusCode: 201,
    message: "Supplier catalogue created successfully!",
    data: completeCatalogue,
  };
};

export const executeBulkUploadSupplierCatalogue = async (
  filePath: string,
  user: any,
  transaction: Transaction
) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);

  let total = rows.length;
  let successCount = 0;
  let failedCount = 0;

  console.log("TOTAL ROWS:", total);

  const organizationResponse = await getOrganizationById(
    user.organization_id
  );

  if (!organizationResponse?.id) {
    throw new Error("Organization not found");
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    console.log(`Processing row ${i + 1}`);

    try {
      // VALIDATION
      const { error } = supplierCatalogueValidation.validate(row);

      if (error) {
        failedCount++;
        console.log(`Row ${i + 1} validation failed`, error.message);
        continue;
      }

      // SKU CHECK
      if (row.sku) {
        const existingSku = await supplierCatalogueService.findOne({
          where: { sku: row.sku },
        });

        if (existingSku) {
          failedCount++;
          console.log(`Row ${i + 1} duplicate SKU`);
          continue;
        }
      }

      const catalogueData = {
        organization_id: user.organization_id,
        user_id: user.id,
        item_name: row.item_name,
        item_description: row.item_description || null,
        supplier_category_id: row.supplier_category_id,
        brand_name: row.brand_name || null,
        sku: row.sku || null,
        stock_price: row.stock_price,
        estimated_shipping_price: row.estimated_shipping_price,
        estimated_tax: row.estimated_tax,
        estimated_total_price: row.estimated_total_price,
        dimensions: row.dimensions,
        weight: row.weight,
        type: row.type || "item",
        is_active: row.is_active ?? true,
        unit: row.unit || "piece",
      };

      await supplierCatalogueService.create(catalogueData, {
        transaction,
      });

      successCount++;
      console.log(`Row ${i + 1} saved`);
    } catch (err) {
      failedCount++;
      console.log(`Row ${i + 1} error`, err);
      continue;
    }
  }

  console.log("UPLOAD SUMMARY");
  console.log("Total:", total);
  console.log("Success:", successCount);
  console.log("Failed:", failedCount);

  return {
    total,
    success: successCount,
    failed: failedCount,
  };
};

export const executeUpdateSupplierCatalogueLocations = async (
  catalogueId: string,
  locations: any[],
  user: any,
  transaction: Transaction
) => {
  const catalogue = await supplierCatalogueService.findOne({
    where: {
      id: catalogueId,
      organization_id: user.organization_id,
    },
  });

  if (!catalogue) {
    return {
      success: false,
      statusCode: 404,
      message: "Catalogue not found",
    };
  }

  console.log("=================================");
  console.log("OLD LOCATIONS:");
  console.log(JSON.stringify(catalogue.locations, null, 2));

  console.log("NEW LOCATIONS RECEIVED:");
  console.log(JSON.stringify(locations, null, 2));
  console.log("=================================");

  const [count, records] = await supplierCatalogueService.update(
    {
      locations,
    },
    {
      where: {
        id: catalogueId,
        organization_id: user.organization_id,
      },
      transaction,
    }
  );

  console.log("UPDATED ROWS COUNT:", count);
  console.log("UPDATED RECORDS:");
  console.log(JSON.stringify(records, null, 2));

  const updatedCatalogue = await supplierCatalogueService.findOne({
    where: {
      id: catalogueId,
      organization_id: user.organization_id,
    },
      transaction,
  });

  console.log("=================================");
  console.log("LOCATIONS AFTER UPDATE:");
  console.log(JSON.stringify(updatedCatalogue?.locations, null, 2));
  console.log("=================================");

  return {
    success: true,
    statusCode: 200,
    message: "Locations updated successfully",
    data: updatedCatalogue,
  };
};

export const executeUpdateSupplierCatalogue = async (
  data: any,
  user: any,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;

  const organizationResponse = await getOrganizationById(organization_id);

  if (!organizationResponse || !organizationResponse.id) {
    return {
      success: false,
      statusCode: 404,
      message: "Organization not found",
    };
  }

  const existingCatalogue = await supplierCatalogueService.findOne({
    where: {
      id: data.supplier_catalogue_id,
      organization_id,
    },
  });

  if (!existingCatalogue) {
    return {
      success: false,
      statusCode: 404,
      message: "Supplier catalogue not found or access denied",
    };
  }

  if (data.sku && data.sku !== existingCatalogue.sku) {
    const existingSku = await supplierCatalogueService.findOne({
      where: {
        sku: data.sku,
        id: { [Op.ne]: data.supplier_catalogue_id },
      },
    });

    if (existingSku) {
      return {
        success: false,
        statusCode: 409,
        message: "SKU already exists",
      };
    }
  }

  const catalogueUpdateData: any = {};
  const allowedFields = [
    "item_name",
    "item_description",
    "supplier_category_id",
    "brand_name",
    "sku",
    "stock_price",
    "estimated_shipping_price",
    "estimated_tax",
    "estimated_total_price",
    "dimensions",
    "weight",
    "type",
    "is_active",
    "unit",
  ];

  allowedFields.forEach((field) => {
    if (data.hasOwnProperty(field)) {
      catalogueUpdateData[field] = data[field];
    }
  });

  const [updatedCount] = await supplierCatalogueService.update(
    catalogueUpdateData,
    {
      where: { id: data.supplier_catalogue_id },
      transaction,
    }
  );

  if (updatedCount === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Supplier catalogue not found",
    };
  }

  if (data.images && Array.isArray(data.images)) {
    // Fetch current images from DB
    const existingImages = await SupplierItemImage.findAll({
      where: { supplier_catalogue_id: data.supplier_catalogue_id },
      transaction,
    });

    const incomingImageIds = data.images
      .filter((img: any) => img.id)
      .map((img: any) => img.id);

    // Delete images that are no longer in the incoming payload
    const imagesToDelete = existingImages.filter(
      (img) => !incomingImageIds.includes(img.id)
    );
    for (const img of imagesToDelete) {
      await SupplierItemImage.destroy({
        where: { id: img.id },
        transaction,
      });
    }

    // Upsert logic
    for (const image of data.images) {
      if (image.id) {
        // Update existing image
        await SupplierItemImage.update(
          { file_url: image.file_url },
          {
            where: {
              id: image.id,
              supplier_catalogue_id: data.supplier_catalogue_id,
            },
            transaction,
          }
        );
      } else {
        // Create new image
        await SupplierItemImage.create(
          {
            supplier_catalogue_id: data.supplier_catalogue_id,
            file_url: image.file_url,
          },
          { transaction }
        );
      }
    }
  }

  const updatedCatalogue = await supplierCatalogueService.findById(
    data.supplier_catalogue_id,
    {
      include: [
        {
          model: SupplierItemImage,
          as: "supplierCatalogueImages",
        },
      ],
      transaction,
    }
  );

  return {
    success: true,
    statusCode: 200,
    message: "Supplier catalogue updated successfully!",
    data: updatedCatalogue,
  };
};

export const executeGetCatalogueById = async (
  catalogueId: string,
  user: any
) => {
  const organization_id = user?.organization_id;

  const organizationResponse = await getOrganizationById(organization_id);
  if (!organizationResponse || !organizationResponse.id) {
    return {
      success: false,
      statusCode: 404,
      message: "Organization not found",
    };
  }

  const catalogue = await supplierCatalogueService.findOne({
    where: {
      id: catalogueId,
      organization_id,
    },
    include: [
      {
        model: SupplierItemImage,
        as: "supplierCatalogueImages",
      },
      {
        model: SupplierIndustry,
        as: "industry",
      },
    ],
  });

  if (!catalogue) {
    return {
      success: false,
      statusCode: 404,
      message: "Catalogue not found",
    };
  }

  let category = null;
  if (catalogue.supplier_category_id) {
    category = await getOrgCategoryById(catalogue.supplier_category_id);
  }

  let locationsWithBranchName = [];

  if (
    catalogue.locations &&
    Array.isArray(catalogue.locations) &&
    catalogue.locations.length > 0
  ) {
    const branchIds = catalogue.locations.map(
      (location: any) => location.subsidiary_branch_id
    );

    const branches: any[] = await AppDataSource.query(
      `
      SELECT id, branch_name
      FROM subsidiary_branches
      WHERE id IN (:branchIds)
    `,
      {
        replacements: { branchIds },
        type: QueryTypes.SELECT,
      }
    );

    const branchMap = new Map(
      branches.map((branch: any) => [branch.id, branch.branch_name])
    );

    locationsWithBranchName = catalogue.locations.map((location: any) => ({
      ...location,
      branch_name:
        branchMap.get(location.subsidiary_branch_id) || null,
    }));
  }

  return {
    success: true,
    statusCode: 200,
    message: "Catalogue retrieved successfully",
    data: {
      ...catalogue,
      category,
      locations: locationsWithBranchName,
    },
  };
};

export const executeGetAllCatalogues = async (requestData: any) => {
  let result;

  const { page, limit, organization_id, search, type, is_active, item_name, supplier_category_id,
    min_price, max_price, restock_from_date, restock_to_date, } = requestData;

  const whereCondition: any = {
    organization_id: organization_id,
  };
  if (search) {
    whereCondition.item_name = { [Op.iLike]: `%${search}%` };
  }

  // type filter
  if (type) {
    whereCondition.type = type;
  }

  // status filter
  if (is_active !== undefined) {
    whereCondition.is_active = is_active;
  }

  // Product Name Filter
  if (item_name) {
    whereCondition.item_name = {
      [Op.iLike]: `%${item_name}%`,
    };
  }

  // Category Filter
  if (supplier_category_id) {
    whereCondition.supplier_category_id = supplier_category_id;
  }

  // Unit Price Range Filter
  if (min_price !== undefined && max_price !== undefined) {
    whereCondition.estimated_total_price = {
      [Op.between]: [min_price, max_price],
    };
  } else if (min_price !== undefined) {
    whereCondition.estimated_total_price = {
      [Op.gte]: min_price,
    };
  } else if (max_price !== undefined) {
    whereCondition.estimated_total_price = {
      [Op.lte]: max_price,
    };
  }

  // Last Restock Date Filter
  if (restock_from_date && restock_to_date) {
    whereCondition.updated_at = {
      [Op.between]: [
        new Date(restock_from_date),
        new Date(restock_to_date),
      ],
    };
  } else if (restock_from_date) {
    whereCondition.updated_at = {
      [Op.gte]: new Date(restock_from_date),
    };
  } else if (restock_to_date) {
    whereCondition.updated_at = {
      [Op.lte]: new Date(restock_to_date),
    };
  }

  const includeOptions = [
    {
      model: SupplierItemImage,
      as: "supplierCatalogueImages",
    },
    {
      model: SupplierIndustry,
      as: "industry",
    },
  ];

  if (page && limit) {
    result = await supplierCatalogueService.paginate({
      page,
      limit,
      options: {
        where: whereCondition,
        include: includeOptions,
      },
    });
    // append category data for each catalogue
    result.data = await Promise.all(
      result.data.map(async (catalogue: any) => {
        if (catalogue.supplier_category_id) {
          const category = await getOrgCategoryById(
            catalogue.supplier_category_id
          );
          return {
            ...catalogue, // Sequelize model → plain object
            category,
          };
        }
        return catalogue;
      })
    );
  } else {
    const catalogueList = await supplierCatalogueService.findAll({
      where: whereCondition,
      include: includeOptions,
    });
    const enrichedList = await Promise.all(
      catalogueList.map(async (catalogue: any) => {
        if (catalogue.supplier_category_id) {
          const category = await getOrgCategoryById(
            catalogue.supplier_category_id
          );
          return {
            ...catalogue,
            category,
          };
        }
        return catalogue;
      })
    );

    result = {
      data: enrichedList,
      total: enrichedList.length,
      pages: 1,
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Catalogues list fetched successfully",
    data: result,
  };
};

export const executeDeleteCatalogue = async (
  supplier_catalogue_id: string,
  user: any,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;

  const organizationResponse = await getOrganizationById(organization_id);
  if (!organizationResponse || !organizationResponse.id) {
    return {
      success: false,
      statusCode: 404,
      message: "Organization not found",
    };
  }

  const existingCatalogue = await supplierCatalogueService.findOne({
    where: {
      id: supplier_catalogue_id,
      organization_id,
    },
  });

  if (!existingCatalogue) {
    return {
      success: false,
      statusCode: 404,
      message: "Catalogue not found or access denied",
    };
  }

  await supplierCatalogueImageService.delete({
    where: {
      supplier_catalogue_id: supplier_catalogue_id,
    },
    transaction,
  });

  const deletedCount = await supplierCatalogueService.delete({
    where: {
      id: supplier_catalogue_id,
      organization_id,
    },
    transaction,
  });

  if (deletedCount === 0) {
    return {
      success: false,
      statusCode: 404,
      message: "Catalogue not found",
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Catalogue deleted successfully",
  };
};
