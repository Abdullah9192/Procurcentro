import { Request, Response } from "express";
import SupplierRating from "../../../models/SupplierRating";
import { createSupplierSubRatingSchema } from "../../validators/CatalogueValidation";
import {
  errorResponse,
  successResponse,
} from "../../../utils/general/ResponseUtils";
import { http } from "../../../services/AxiosClient";
import { service } from "../../../../config/EnvVariables";

// ====== Add Rating ======
// export const addSupplierRating = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { supplier_user_id, rating_user_id, rating, comment } = req.body;

//     if (!supplier_user_id || !rating_user_id || !rating) {
//       errorResponse(res, {
//         statusCode: 400,
//         message: "supplier_user_id, rating_user_id and rating are required",
//       });
//       return;
//     }

//     const newRating = await SupplierRating.create({
//       supplier_user_id,
//       rating_user_id,
//       rating,
//       comment,
//     });

//     // 🔹 Success response
//     successResponse(res, {
//       statusCode: 201,
//       message: "Supplier rating added successfully",
//       data: newRating,
//     });
//   } catch (error: any) {
//     console.error("Error adding supplier rating:", error);
//     errorResponse(res, {
//       statusCode: 500,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

export const addSupplierRating = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 🔹 Validate input using Joi
    const { error, value } = createSupplierSubRatingSchema.validate(req.body);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }

    // 🔹 Destructure ratings
    const {
      supplier_user_id,
      rating_user_id,
      quality_item_rating,
      fullfill_order_rating,
      resolving_complaint_rating,
      shipment_terms_rating,
      communication_rating,
      experience_working_rating,
      comment,
    } = value;

    // 🔹 Calculate average (overall_rating)
    const ratings = [
      quality_item_rating,
      fullfill_order_rating,
      resolving_complaint_rating,
      shipment_terms_rating,
      communication_rating,
      experience_working_rating,
    ];

    const overall_rating =
      ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    // 🔹 Create record in DB
    const rating = await SupplierRating.create({
      supplier_user_id,
      rating_user_id,
      quality_item_rating,
      fullfill_order_rating,
      resolving_complaint_rating,
      shipment_terms_rating,
      communication_rating,
      experience_working_rating,
      overall_rating,
      comment,
    });

    // 🔔 Notify supplier about new rating
    try {
      await http.post(
        `/v1/notification/create`,
        {
          sender_id: rating_user_id,
          receiver_id: supplier_user_id,
          organization_id: (req as any).user?.organization_id, // if available
          subsidiary_id: null,
          notification_type: "supplier_rating_added",
          notification_module: "supplier",
          message: `You have received a new rating.`,
        },
        {
          baseURL: service.NOTIFICATION_SERVICE_URL,
        }
      );
    } catch (err) {
      console.error("Notification failed:", err);
    }

    // 🔹 Success response
    successResponse(res, {
      statusCode: 201,
      message: "Supplier rating added successfully",
      data: rating,
    });
  } catch (error: any) {
    console.error("Error adding supplier ratings:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ====== Get Ratings (with average) ======
export const getSupplierRatings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplierId } = req.params;

    if (!supplierId) {
      errorResponse(res, {
        statusCode: 400,
        message: "supplierId is required",
      });
      return;
    }

    const ratings = await SupplierRating.findAll({
      where: { supplier_user_id: supplierId },
      order: [["created_at", "DESC"]],
    });

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.overall_rating, 0) / ratings.length
        : 0;

    // 🔹 Success response
    successResponse(res, {
      statusCode: 200,
      message: "Supplier ratings fetched successfully",
      data: {
        average_rating: avgRating,
        total_ratings: ratings.length,
        ratings: ratings,
      },
    });
  } catch (error: any) {
    console.error("Error fetching supplier ratings:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
