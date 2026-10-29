import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/ResponseUtils";
import ClauseLibrary from "../../models/ClauseLibrary";
import ClauseLibraryVariation from "../../models/ClauseLibraryVariation";

// ✅ CREATE Clause Library (with variations)
export const addClauseLibrary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      organization_id,
      clause_type,
      clause_name,
      date_modification,
      variations,
    } = req.body;

    if (!organization_id || !clause_type || !clause_name) {
      errorResponse(res, {
        statusCode: 400,
        message: "organization_id, clause_type and clause_name are required",
      });
      return;
    }

    // 🔹 Step 1: Create Clause Library
    const clauseLibrary = await ClauseLibrary.create({
      organization_id,
      clause_type,
      clause_name,
      date_modification,
    });

    // 🔹 Step 2: Create Clause Variations if provided
    if (Array.isArray(variations) && variations.length > 0) {
      for (const variation of variations) {
        await ClauseLibraryVariation.create({
          organization_id,
          clause_library_id: clauseLibrary.id,
          title: variation.title,
          language: variation.language,
          is_primary: variation.is_primary || false,
        });
      }
    }

    // 🔹 Step 3: Fetch library with variations
    const libraryWithVariations = await ClauseLibrary.findByPk(
      clauseLibrary.id,
      {
        include: [{ model: ClauseLibraryVariation, as: "variations" }],
      }
    );

    successResponse(res, {
      statusCode: 201,
      message: "Clause library created successfully",
      data: libraryWithVariations,
    });
  } catch (error: any) {
    console.error("Error creating clause library:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 📖 GET all clause libraries (with variations)
export const getAllClauseLibraries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { page = 1, limit = 10, organization_id } = req.query;

    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (organization_id) {
      whereClause.organization_id = organization_id;
    }

    const { rows, count } = await ClauseLibrary.findAndCountAll({
      where: whereClause,
      include: [{ model: ClauseLibraryVariation, as: "variations" }],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    successResponse(res, {
      statusCode: 200,
      message: "Clause libraries fetched successfully",
      data: {
        records: rows,
        pagination: {
          totalRecords: count,
          totalPages,
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching clause libraries:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 🔍 GET single clause library by ID
export const getClauseLibraryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const library = await ClauseLibrary.findByPk(id, {
      include: [{ model: ClauseLibraryVariation, as: "variations" }],
    });

    if (!library) {
      errorResponse(res, {
        statusCode: 404,
        message: "Clause library not found",
      });
      return;
    }

    successResponse(res, {
      statusCode: 200,
      message: "Clause library fetched successfully",
      data: library,
    });
  } catch (error: any) {
    console.error("Error fetching clause library:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✏️ UPDATE Clause Library (and variations)
export const updateClauseLibrary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { clause_type, clause_name, date_modification, variations } =
      req.body;

    const library = await ClauseLibrary.findByPk(id);
    if (!library) {
      errorResponse(res, {
        statusCode: 404,
        message: "Clause library not found",
      });
      return;
    }

    await library.update({ clause_type, clause_name, date_modification });

    // 🔹 Optional: Replace variations
    if (variations && variations.length > 0) {
      await ClauseLibraryVariation.destroy({
        where: { clause_library_id: id },
      });
      for (const variation of variations) {
        await ClauseLibraryVariation.create({
          ...variation,
          clause_library_id: id,
        });
      }
    }

    successResponse(res, {
      statusCode: 200,
      message: "Clause library updated successfully",
      data: library,
    });
  } catch (error: any) {
    console.error("Error updating clause library:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ❌ DELETE Clause Library
export const deleteClauseLibrary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const library = await ClauseLibrary.findByPk(id);
    if (!library) {
      errorResponse(res, {
        statusCode: 404,
        message: "Clause library not found",
      });
      return;
    }

    await ClauseLibraryVariation.destroy({ where: { clause_library_id: id } });
    await library.destroy();

    successResponse(res, {
      statusCode: 200,
      message: "Clause library deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting clause library:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
