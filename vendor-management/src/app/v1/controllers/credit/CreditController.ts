import { Request, Response } from "express";
import {
  errorResponse,
  successResponse,
} from "../../../utils/general/ResponseUtils";
import AppDataSource from "../../../../config/DatabaseSource";
import { col, fn, Op, QueryTypes } from "sequelize";
import dayjs from "dayjs";
import {
  verifyDocument,
  verifyMultipleDocuments,
} from "../../../services/DocumentService";
import SupplierDocument from "../../../models/SupplierDocument";
import SupplierCreditTransaction from "../../../models/SupplierCreditTransaction";
import SupplierCreditWallet from "../../../models/SupplierCreditWallet";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  MONO_DOCS_BASE_URL,
  MONO_SECRET_KEY,
  PAYSTACK_SECRET_KEY,
} from "../../../../config/EnvVariables";
import SupplierInfo from "../../../models/SupplierInfo";
import SupplierContact from "../../../models/SupplierContact";
import SupplierKyc from "../../../models/SupplierKyc";

const DOC_CREDIT_COST: Record<string, number> = {
  bvn: 2,
  cac: 4,
  vat: 1,
  tin: 5,
  nin: 5,
};
// =======Buy Credits :
export const buyCredits = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    console.log("User authentication failed");

    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });

    return;
  }

  try {
    const { credit_points, amount_naira, user_id, organization_id, email } = req.body;
    console.log("========== CREDIT DEBUG START ==========");

    console.log("Received amount_naira:", amount_naira);
    console.log("Received credit_points:", credit_points);

    // Convert amount
    const amountInKobo = Number(amount_naira) * 100;
    console.log("Amount In Kobo:", amountInKobo);

    const credits = Number(credit_points);
    console.log("Converted Credits:", credits);

    console.log("Type of credit_points:", typeof credit_points);
    console.log("Type of credits:", typeof credits);

    // Generate transaction ID
    const transactionId = uuidv4();

    // Callback URL
    const callbackUrl =
      user.user_type === "admin"
        ? "https://staging.admin.procurecentro.com/admin/dashboard"
        : "https://staging.vendor.procurecentro.com/vendor/dashboard";

    // Paystack initialize

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        amount: amountInKobo,
        email,
        reference: transactionId,
        callback_url: callbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const paystackData = response.data.data;
    console.log("Transaction Create Payload:", {
      credits: credit_points,
      credits_purchased: credits,
    });

    // Create transaction
    const txn = await SupplierCreditTransaction.create({
      transaction_id: transactionId,
      organization_id,
      user_id,
      type: "purchase",
      credits: credit_points,
      credits_purchased: credits,
      amount: amount_naira,
      amount_paid: amount_naira,
      payment_reference: paystackData.reference,
      status: "pending",
      description: "Credit purchase initiated",
      balance_after: 0,
      metadata: paystackData,
    });

    console.log("Transaction Saved Successfully");

    console.log("Saved Transaction Credits:", txn.credits);
    console.log("Saved Transaction Credits Purchased:", txn.credits_purchased);

    console.log("========== CREDIT DEBUG END ==========");

    // Find wallet
    const wallet = await SupplierCreditWallet.findOne({
      where: { user_id: txn.user_id },
    });

    const creditsToAdd = Number(txn.credits_purchased ?? 0);

    const currentBalance = Number(wallet?.balance ?? 0);

    const newBalance = currentBalance + creditsToAdd;

    // Update/Create wallet
    if (wallet) {
      console.log("Updating Existing Wallet...");

      await wallet.update({
        balance: newBalance,
      });
    } else {
      await SupplierCreditWallet.create({
        organization_id: txn.organization_id,
        user_id: txn.user_id,
        balance: newBalance,
      });
    }

    // Update transaction
    await txn.update({
      status: "successful",
      balance_after: newBalance,
      description: "Credits purchased successfully via Paystack",
    });
    res.json({
      success: true,
      message: "Payment initialized",
      authorization_url: paystackData.authorization_url,
      reference: paystackData.reference,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: error?.message || "Unknown error",
    });
  }
};

export const handlePaystackWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const event = req.body;
    console.log("Paystack webhook event:", event);

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      const txn = await SupplierCreditTransaction.findOne({
        where: { payment_reference: reference },
      });

      if (txn && txn.status === "pending") {
        const wallet = await SupplierCreditWallet.findOne({
          where: { user_id: txn.user_id },
        });

        const creditsToAdd = txn.credits_purchased ?? 0;
        const currentBalance = wallet?.balance ?? 0;
        const newBalance = currentBalance + creditsToAdd;

        // ✅ Update or create wallet
        if (wallet) {
          await wallet.update({ balance: newBalance });
        } else {
          await SupplierCreditWallet.create({
            organization_id: txn.organization_id,
            user_id: txn.user_id,
            balance: newBalance,
          });
        }

        // ✅ Mark transaction as successful
        await txn.update({
          status: "successful",
          balance_after: newBalance,
          description: "Credits purchased successfully via Paystack",
        });
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Paystack webhook error:", error);
    res.sendStatus(500);
  }
};

// verifyNinNumber
export const verifyNinNumber = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cost = DOC_CREDIT_COST["nin"];
    console.log("cost is : ", cost);
    const user = (req as any).user;
    if (
      !user?.id ||
      !user?.email ||
      !user?.is_active ||
      !user?.organization_id
    ) {
      errorResponse(res, {
        message: "User authentication required",
        statusCode: 401,
      });
      return;
    }
    const wallet = await SupplierCreditWallet.findOne({
      where: { user_id: user?.id },
    });
    if (!wallet || wallet.balance < cost) {
      throw new Error("Insufficient Credits");
    }
    const { nin } = req.body;

    if (!nin) {
      res.status(400).json({
        success: false,
        message: "NIN number is required",
      });
      return;
    }

    const response = await axios.post(
      `${MONO_DOCS_BASE_URL}/lookup/nin`,
      { nin },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "mono-sec-key": MONO_SECRET_KEY,
        },
      },
    );

    res.status(200).json({
      success: true,
      message: "NIN verification successful",
      data: response.data,
    });
  } catch (error) {
    console.error("NIN verification failed:", error);

    errorResponse(res, {
      statusCode: 500,
      message: "NIN verification failed",
      error: error,
    });
  }
};

// verifyTinNumber
export const verifyTinNumber = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cost = DOC_CREDIT_COST["tin"];
    console.log("cost is : ", cost);
    const user = (req as any).user;
    if (
      !user?.id ||
      !user?.email ||
      !user?.is_active ||
      !user?.organization_id
    ) {
      errorResponse(res, {
        message: "User authentication required",
        statusCode: 401,
      });
      return;
    }
    const wallet = await SupplierCreditWallet.findOne({
      where: { user_id: user?.id },
    });
    if (!wallet || wallet.balance < cost) {
      throw new Error("Insufficient Credits");
    }
    const { number, channel } = req.body;

    if (!number || !channel) {
      res.status(400).json({
        success: false,
        message: "Number and channel is required",
      });
      return;
    }

    const response = await axios.post(
      `${MONO_DOCS_BASE_URL}/lookup/tin`,
      { number, channel },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "mono-sec-key": MONO_SECRET_KEY,
        },
      },
    );

    res.status(200).json({
      success: true,
      message: "TIN verification successful",
      data: response.data,
    });
  } catch (error) {
    console.error("TIN verification failed:", error);

    errorResponse(res, {
      statusCode: 500,
      message: "TIN verification failed",
      error: error,
    });
  }
};

// verifyBvnNumber
export const verifyCACNumber = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cost = DOC_CREDIT_COST["cac"];
    console.log("cost is : ", cost);
    const user = (req as any).user;
    if (
      !user?.id ||
      !user?.email ||
      !user?.is_active ||
      !user?.organization_id
    ) {
      errorResponse(res, {
        message: "User authentication required",
        statusCode: 401,
      });
      return;
    }
    const wallet = await SupplierCreditWallet.findOne({
      where: { user_id: user?.id },
    });
    if (!wallet || wallet.balance < cost) {
      throw new Error("Insufficient Credits");
    }

    const { search } = req.params;

    if (!search) {
      res.status(400).json({
        success: false,
        message: "Search Business Param is required",
      });
      return;
    }

    const response = await axios.get(
      `${MONO_DOCS_BASE_URL}/lookup/cac?search=${search}`,
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "mono-sec-key": MONO_SECRET_KEY,
        },
      },
    );

    res.status(200).json({
      success: true,
      message: "Business exists successful",
      data: response.data,
    });
  } catch (error) {
    console.error("Business verification failed:", error);

    errorResponse(res, {
      statusCode: 500,
      message: "Business verification failed",
      error: error,
    });
  }
};

// Endpoint: GET /v1/credits/debit-graph?start_date=2026-02-01&end_date=2026-02-23
export const getDebitTransactionsGraph = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = (req as any).user;
  const transactionType = user.user_type === "admin" ? "purchase" : "debit";

  if (!user?.id || !user?.organization_id) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    // Parse start and end dates
    const startDate = req.query.start_date
      ? new Date(req.query.start_date as string)
      : new Date("2000-01-01");
    const endDate = req.query.end_date
      ? new Date(req.query.end_date as string)
      : new Date();

    // 1️⃣ Fetch raw debit transactions in date range
    const rawTransactions = await SupplierCreditTransaction.findAll({
      where: {
        organization_id: user.organization_id,
        user_id: user.id,
        type: transactionType,
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["created_at", "ASC"]],
      attributes: ["id", "transaction_id", "credits", "amount", "created_at"],
    });

    // 2️⃣ Fetch daily aggregated totals for graph
    const dailyTotals = await SupplierCreditTransaction.findAll({
      where: {
        organization_id: user.organization_id,
        user_id: user.id,
        type: "debit",
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [fn("DATE", col("created_at")), "date"],
        [fn("SUM", col("credits")), "total_credits"],
        [fn("SUM", col("amount")), "total_amount"],
      ],
      group: [fn("DATE", col("created_at"))],
      order: [[fn("DATE", col("created_at")), "ASC"]],
      raw: true, // return plain objects
    });

    res.json({
      success: true,
      message: "Debit transactions and daily totals fetched successfully",
      data: {
        rawTransactions,
        dailyTotals,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching debit transactions for graph",
      error: err.message,
    });
  }
};

// =======Verify Documents :
export const verifySupplierDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const { id, number } = req.params;

  try {
    const result = await verifyDocument(
      user.organization_id,
      user.id,
      id,
      number,
      user.user_type,
    );

    successResponse(res, {
      statusCode: 200,
      message: "Document verification processed successfully",
      data: result,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 400,
      message: err.message || "Document verification failed",
    });
  }
};

export const verifyMultipleSupplierDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const { documents } = req.body;

  if (!Array.isArray(documents) || documents.length === 0) {
    errorResponse(res, {
      message: "Documents array is required",
      statusCode: 400,
    });
    return;
  }

  try {
    const result = await verifyMultipleDocuments(
      user.organization_id,
      user.id,
      documents,
    );

    successResponse(res, {
      statusCode: 200,
      message: "Documents verification processed successfully",
      data: result,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: err.message || "Internal server error",
    });
    return;
  }
};

// =======Get Supplier  Documents :
export const getSupplierDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { status, type, page = 1, pageSize = 10 } = req.query;
  try {
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    // Build filter conditions
    const whereClause: any = {
      user_id: user.id,
      organization_id: user.organization_id,
    };

    if (status) {
      whereClause.status = status;
    }

    // Filter by verified_type (mono_docs | admin)
    if (type && (type === "mono_docs" || type === "admin")) {
      whereClause.verified_type = type;
    }

    const { rows: documents, count: total } =
      await SupplierDocument.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: SupplierInfo,
            as: "basic_info",
            required: false,
          },
          {
            model: SupplierContact,
            as: "contact_info",
            required: false,
          },
          {
            model: SupplierKyc,
            as: "supplier_info",
            required: false,
          },
        ],
        order: [["created_at", "DESC"]],
        limit,
        offset,
      });

    successResponse(res, {
      statusCode: 200,
      message: "Documents retrieved successfully.",
      data: {
        documents,
        pagination: {
          total,
          page: Number(page),
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to retrieve documents.",
      error: err,
    });
  }
};

// ===== Get Credit Transaction History =====
export const getCreditTransactionHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereClause: any = { organization_id: user.organization_id };
    if (user.id) {
      whereClause.user_id = user.id;
    }

    const { rows, count } = await SupplierCreditTransaction.findAndCountAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: SupplierDocument,
          as: "document",
          attributes: [
            "id",
            "document_name",
            "status",
            "is_verified",
            "verified_at",
            "section_number",
          ],
        },
      ],
    });

    successResponse(res, {
      statusCode: 200,
      message: "Credit transaction history fetched successfully",
      data: {
        rows,
        pagination: {
          totalRecords: count,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Error fetching credit transaction history",
      error: err,
    });
  }
};

// ===== Get Wallet Balance =====
export const getWalletBalance = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  try {
    const whereClause: any = { organization_id: user.organization_id };
    if (user.id) {
      whereClause.user_id = user.id;
    }

    const wallet = await SupplierCreditWallet.findOne({ where: whereClause });

    if (!wallet) {
      errorResponse(res, {
        statusCode: 404,
        message: "Wallet not found for given organization/user",
      });
      return;
    }

    successResponse(res, {
      statusCode: 200,
      message: "Wallet balance fetched successfully",
      data: wallet,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Error fetching wallet balance",
      error: err,
    });
  }
};

// ===== Get Vendor Dashboard =====
export const getVendorDashboardData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const supplierId = user.id;

    const { filter, from_date, to_date } = req.query;

    let startDate: Date;
    let endDate: Date;

    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (filter) {
      case "today":
        startDate = dayjs().startOf("day").toDate();
        endDate = dayjs().endOf("day").toDate();

        previousStartDate = dayjs()
          .subtract(1, "day")
          .startOf("day")
          .toDate();

        previousEndDate = dayjs()
          .subtract(1, "day")
          .endOf("day")
          .toDate();
        break;

      case "last_7_days":
        startDate = dayjs().subtract(6, "day").startOf("day").toDate();
        endDate = dayjs().endOf("day").toDate();

        previousStartDate = dayjs()
          .subtract(13, "day")
          .startOf("day")
          .toDate();

        previousEndDate = dayjs()
          .subtract(7, "day")
          .endOf("day")
          .toDate();
        break;

      case "last_30_days":
        startDate = dayjs().subtract(29, "day").startOf("day").toDate();
        endDate = dayjs().endOf("day").toDate();

        previousStartDate = dayjs()
          .subtract(59, "day")
          .startOf("day")
          .toDate();

        previousEndDate = dayjs()
          .subtract(30, "day")
          .endOf("day")
          .toDate();
        break;

      case "last_3_months":
        startDate = dayjs().subtract(3, "month").startOf("day").toDate();
        endDate = dayjs().endOf("day").toDate();

        previousStartDate = dayjs()
          .subtract(6, "month")
          .startOf("day")
          .toDate();

        previousEndDate = dayjs()
          .subtract(3, "month")
          .endOf("day")
          .toDate();
        break;

      case "last_6_months":
        startDate = dayjs().subtract(6, "month").startOf("day").toDate();
        endDate = dayjs().endOf("day").toDate();

        previousStartDate = dayjs()
          .subtract(12, "month")
          .startOf("day")
          .toDate();

        previousEndDate = dayjs()
          .subtract(6, "month")
          .endOf("day")
          .toDate();
        break;

      case "last_12_months":
        startDate = dayjs().subtract(12, "month").startOf("day").toDate();
        endDate = dayjs().endOf("day").toDate();

        previousStartDate = dayjs()
          .subtract(24, "month")
          .startOf("day")
          .toDate();

        previousEndDate = dayjs()
          .subtract(12, "month")
          .endOf("day")
          .toDate();
        break;

      case "custom":
        if (!from_date || !to_date) {
          errorResponse(res, {
            statusCode: 400,
            message: "from_date and to_date are required",
          });
          return;
        }

        startDate = dayjs(from_date as string).startOf("day").toDate();
        endDate = dayjs(to_date as string).endOf("day").toDate();

        const diffDays = dayjs(endDate).diff(startDate, "day");

        previousStartDate = dayjs(startDate)
          .subtract(diffDays + 1, "day")
          .toDate();

        previousEndDate = dayjs(startDate)
          .subtract(1, "day")
          .endOf("day")
          .toDate();

        break;

      default:
        startDate = dayjs().startOf("month").toDate();
        endDate = dayjs().endOf("month").toDate();

        previousStartDate = dayjs()
          .subtract(1, "month")
          .startOf("month")
          .toDate();

        previousEndDate = dayjs()
          .subtract(1, "month")
          .endOf("month")
          .toDate();
    }

    const [
      walletResult,
      ratingResult,
      bidsResult,
      processingResult,
      pendingQuotationResult,
      pendingPOResult,
      pendingInvoiceResult,
      catalogueResult,
      revenueResult,
      topSalesResult,
      lastMonthRatingResult,
      lastMonthBidsResult,
      lastMonthProcessingResult,
      lastMonthPendingQuotationResult,
      lastMonthPendingPOResult,
      lastMonthPendingInvoiceResult,
      supplierDocsResult,
      recentOrdersResult,
      recentCommentsResult,
    ] = await Promise.all([
      // Wallet
      AppDataSource.query(
        `
        SELECT balance
        FROM supplier_credit_wallets
        WHERE organization_id = :organizationId
        AND user_id = :supplierId
        LIMIT 1
        `,
        {
          replacements: {
            organizationId: user.organization_id,
            supplierId,
          },
          type: QueryTypes.SELECT,
        },
      ),

      // Buyer Rating
      AppDataSource.query(
        `
        SELECT COALESCE(AVG(overall_rating), 0) AS avg_rating
        FROM supplier_ratings
        WHERE supplier_user_id = :supplierId
        AND "created_at" BETWEEN :start AND :end
        `,
        {
          replacements: { supplierId, start: startDate, end: endDate },
          type: QueryTypes.SELECT,
        },
      ),

      AppDataSource.query(
        `
  SELECT COALESCE(AVG(overall_rating), 0) AS avg_rating
  FROM supplier_ratings
  WHERE supplier_user_id = :supplierId
  AND "created_at" BETWEEN :lastStart AND :lastEnd
  `,
        {
          replacements: { supplierId, lastStart: previousStartDate, lastEnd: previousEndDate },
          type: QueryTypes.SELECT,
        },
      ),

      // Total Bids
      AppDataSource.query(
        `
        SELECT COALESCE(SUM(total_supplier_amount), 0) AS total_value
        FROM quotation_suppliers
        WHERE supplier_id = :supplierId
        AND "created_at" BETWEEN :start AND :end
        `,
        {
          replacements: { supplierId, start: startDate, end: endDate },
          type: QueryTypes.SELECT,
        },
      ),

      AppDataSource.query(
        `
  SELECT COALESCE(SUM(total_supplier_amount), 0) AS total_value
  FROM quotation_suppliers
  WHERE supplier_id = :supplierId
  AND "created_at" BETWEEN :lastStart AND :lastEnd
  `,
        {
          replacements: { supplierId, lastStart: previousStartDate, lastEnd: previousEndDate },
          type: QueryTypes.SELECT,
        },
      ),

      // Avg Processing Time
      AppDataSource.query(
        `
        SELECT COALESCE(AVG(
          DATE_PART('day', o.supplier_delivery_date - q.expected_delivery_date)
        ), 0) AS avg_days
        FROM orders o
        JOIN quotations q ON o.quotation_id = q.id
        WHERE o.selected_supplier_id = :supplierId
        AND o."created_at" BETWEEN :start AND :end
        AND q."created_at" BETWEEN :start AND :end
        AND o.supplier_delivery_date IS NOT NULL
        AND q.expected_delivery_date IS NOT NULL
        `,
        {
          replacements: { supplierId, start: startDate, end: endDate },
          type: QueryTypes.SELECT,
        },
      ),

      AppDataSource.query(
        `
  SELECT COALESCE(AVG(
    DATE_PART('day', o.supplier_delivery_date - q.expected_delivery_date)
  ), 0) AS avg_days
  FROM orders o
  JOIN quotations q ON o.quotation_id = q.id
  WHERE o.selected_supplier_id = :supplierId
  AND o."created_at" BETWEEN :lastStart AND :lastEnd
  AND q."created_at" BETWEEN :lastStart AND :lastEnd
  AND o.supplier_delivery_date IS NOT NULL
  AND q.expected_delivery_date IS NOT NULL
  `,
        {
          replacements: { supplierId, lastStart: previousStartDate, lastEnd: previousStartDate },
          type: QueryTypes.SELECT,
        },
      ),

      // Pending Quotations
      AppDataSource.query(
        `
        SELECT COUNT(*)::int AS count
        FROM quotation_suppliers
        WHERE supplier_id = :supplierId
        AND supplier_status = 'pending_response'
        AND "created_at" BETWEEN :start AND :end
        `,
        {
          replacements: { supplierId, start: startDate, end: endDate },
          type: QueryTypes.SELECT,
        },
      ),

      AppDataSource.query(
        `
  SELECT COUNT(*)::int AS count
  FROM quotation_suppliers
  WHERE supplier_id = :supplierId
  AND supplier_status = 'pending_response'
  AND "created_at" BETWEEN :lastStart AND :lastEnd
  `,
        {
          replacements: { supplierId, lastStart: previousStartDate, lastEnd: previousEndDate },
          type: QueryTypes.SELECT,
        },
      ),

      // Pending Purchase Orders
      AppDataSource.query(
        `
        SELECT COUNT(*)::int AS count
        FROM orders
        WHERE selected_supplier_id = :supplierId
        AND supplier_status = 'pending'
        AND "created_at" BETWEEN :start AND :end
        `,
        {
          replacements: { supplierId, start: startDate, end: endDate },
          type: QueryTypes.SELECT,
        },
      ),

      AppDataSource.query(
        `
  SELECT COUNT(*)::int AS count
  FROM orders
  WHERE selected_supplier_id = :supplierId
  AND supplier_status = 'pending'
  AND "created_at" BETWEEN :lastStart AND :lastEnd
  `,
        {
          replacements: { supplierId, lastStart: previousStartDate, lastEnd: previousEndDate },
          type: QueryTypes.SELECT,
        },
      ),

      // Pending Invoices
      AppDataSource.query(
        `
        SELECT COUNT(*)::int AS count
        FROM orders
        WHERE selected_supplier_id = :supplierId
        AND invoice_supplier_status IN (
          'partially_received_invoice_pending',
          'fully_invoiced_payment_pending'
        )
        AND "created_at" BETWEEN :start AND :end
        `,
        {
          replacements: { supplierId, start: startDate, end: endDate },
          type: QueryTypes.SELECT,
        },
      ),

      AppDataSource.query(
        `
  SELECT COUNT(*)::int AS count
  FROM orders
  WHERE selected_supplier_id = :supplierId
  AND invoice_supplier_status IN (
    'partially_received_invoice_pending',
    'fully_invoiced_payment_pending'
  )
  AND "created_at" BETWEEN :lastStart AND :lastEnd
  `,
        {
          replacements: { supplierId, lastStart: previousStartDate, lastEnd: previousEndDate },
          type: QueryTypes.SELECT,
        },
      ),

      // Catalogues
      AppDataSource.query(
        `
  SELECT COUNT(*)::int AS total_items
  FROM supplier_catalogues
  WHERE user_id = :supplierId
  `,
        {
          replacements: { supplierId },
          type: QueryTypes.SELECT,
        },
      ),

      //Revenue
      AppDataSource.query(
        `
  SELECT 
    DATE_PART('month', created_at)::int AS month,
    COALESCE(SUM(total_order_amount), 0) AS amount
  FROM orders
  WHERE selected_supplier_id = :supplierId
  AND invoice_supplier_status IN (
    'fully_invoiced_paid',
    'partially_invoiced_paid'
  )
  AND DATE_PART('year', created_at) = DATE_PART('year', CURRENT_DATE)
  GROUP BY DATE_PART('month', created_at)
  ORDER BY month
  `,
        {
          replacements: { supplierId },
          type: QueryTypes.SELECT,
        },
      ),

      // Top Sales (Current Year - Paid Invoices Only)
      AppDataSource.query(
        `
  SELECT 
    osi.item_name,
    COALESCE(SUM(osi.total_amount), 0) AS total_amount
  FROM orders o
  JOIN order_supplier_items osi ON osi.order_id = o.id
  WHERE o.selected_supplier_id = :supplierId
  AND o.invoice_supplier_status IN (
    'fully_invoiced_paid',
    'partially_invoiced_paid'
  )
  AND DATE_PART('year', o.created_at) = DATE_PART('year', CURRENT_DATE)
  GROUP BY osi.item_name
  ORDER BY total_amount DESC
  LIMIT 6
  `,
        {
          replacements: { supplierId },
          type: QueryTypes.SELECT,
        },
      ),

      // Supplier document count and verified count
      AppDataSource.query(
        `
  SELECT COUNT(*) AS total_count,
         COUNT(*) FILTER (WHERE status = 'verified') AS verified_count
  FROM supplier_documents
  WHERE user_id = :supplierId
  `,
        {
          replacements: { supplierId },
          type: QueryTypes.SELECT,
        },
      ),

      // Recent Orders
      AppDataSource.query(
        `
  SELECT *
  FROM orders
  WHERE selected_supplier_id = :supplierId
  AND admin_status = 'sent'
  ORDER BY created_at DESC
  LIMIT 10
  `,
        {
          replacements: { supplierId },
          type: QueryTypes.SELECT,
        },
      ),

      // Recent Comments
      AppDataSource.query(
        `
  SELECT comments, created_at
  FROM quotation_suppliers
  WHERE supplier_id = :supplierId
  AND comments IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 10
  `,
        {
          replacements: { supplierId },
          type: QueryTypes.SELECT,
        },
      ),
    ]);


    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const revenueMap: Record<number, number> = {};

    (revenueResult as any).forEach((row: any) => {
      revenueMap[Number(row.month)] = Number(row.amount);
    });

    const revenue_received = months.map((month, index) => ({
      month,
      amount: revenueMap[index + 1] || 0,
    }));

    const totalYearRevenue = (revenueResult as any).reduce(
      (sum: number, row: any) => sum + Number(row.amount),
      0,
    );

    const top_sales = (topSalesResult as any).map((row: any) => {
      const amount = Number(row.total_amount);

      const percent =
        totalYearRevenue > 0
          ? Number(((amount / totalYearRevenue) * 100).toFixed(2))
          : 0;

      return {
        name: row.item_name,
        percent,
        amount: amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      };
    });

    const compare = (current: number, previous: number) => {
      const percentage =
        previous === 0
          ? current > 0
            ? 100
            : 0
          : Number((((current - previous) / previous) * 100).toFixed(2));

      const trend =
        current > previous
          ? "up"
          : current < previous
            ? "down"
            : "same";

      return { current, previous, percentage, trend };
    };

    const totalDocs = Number((supplierDocsResult[0] as any)?.total_count || 0);
    const verifiedDocs = Number((supplierDocsResult[0] as any)?.verified_count || 0);

    const verifiedPercentage = totalDocs === 0 ? 0 : Number(((verifiedDocs / totalDocs) * 100).toFixed(2));


    const dashboardData = {
      buyer_rating: compare(
        Number((ratingResult as any)[0]?.avg_rating || 0),
        Number((lastMonthRatingResult as any)[0]?.avg_rating || 0),
      ),
      total_value_of_bids: compare(
        Number((bidsResult as any)[0]?.total_value || 0),
        Number((lastMonthBidsResult as any)[0]?.total_value || 0),
      ),
      avg_processing_time_days: compare(
        Number((processingResult as any)[0]?.avg_days || 0),
        Number((lastMonthProcessingResult as any)[0]?.avg_days || 0),
      ),
      pending: {
        quotations: compare(
          (pendingQuotationResult as any)[0]?.count || 0,
          (lastMonthPendingQuotationResult as any)[0]?.count || 0,
        ),
        purchase_orders: compare(
          (pendingPOResult as any)[0]?.count || 0,
          (lastMonthPendingPOResult as any)[0]?.count || 0,
        ),
        invoices: compare(
          (pendingInvoiceResult as any)[0]?.count || 0,
          (lastMonthPendingInvoiceResult as any)[0]?.count || 0,
        ),
      },
      wallet: {
        credit_balance: (walletResult as any)[0]?.balance || 0,
      },
      top_sales,
      catalogue: {
        total_items: (catalogueResult as any)[0]?.total_items || 0,
        top_selling: "",
        low_stock_items: 0,
      },
      revenue_received,
      total: totalDocs,
      verified: verifiedDocs,
      verified_percentage: verifiedPercentage,
      recent_orders: recentOrdersResult,
      recent_comments: recentCommentsResult,
    };

    successResponse(res, {
      statusCode: 200,
      message: "Vendor dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Error fetching dashboard data",
      error: err,
    });
  }
};
