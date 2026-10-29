import axios from "axios";
import SupplierCreditWallet from "../models/SupplierCreditWallet";
import SupplierCreditTransaction from "../models/SupplierCreditTransaction";
import SupplierDocument from "../models/SupplierDocument";
import { MONO_DOCS_BASE_URL, MONO_SECRET_KEY } from "../../config/EnvVariables";
import { v4 as uuidv4 } from "uuid";

const DOC_CREDIT_COST: Record<string, number> = {
  bvn: 2,
  company_registration: 4,
  vat: 1,
  tin: 5,
  nin: 5,
};

/**
 * Verify a document using Mono Docs & deduct credits
 */
export async function verifyDocument(
  orgId: string,
  userId: string,
  documentId: string,
  number: string,
  userType: string,
) {
  try {
    console.log("🔎 Starting document verification:", documentId);

    const document = await SupplierDocument.findOne({
      where: { id: documentId, organization_id: orgId },
    });

    if (!document) {
      throw new Error("STEP 1 FAILED: Document not found");
    }

    await document.update({
      section_number: number,
    });

    const { document_name, section_number } = document;

    let creditCost = 0;
    let response: any;

    // STEP 2: Determine credit cost
    try {
      if (document_name === "company_registration_file") {
        creditCost = 4;
      } else if (document_name === "tax_identification_file") {
        creditCost = 5;
      } else if (document_name === "vat_registration_file") {
        creditCost = 1;
      } else if (document_name === "bank_verification_file") {
        creditCost = 2;
      } else if (document_name === "national_identity_file") {
        creditCost = 5;
      } else {
        throw new Error("Unsupported document type");
      }
    } catch (err) {
      throw new Error(`STEP 2 FAILED (Credit logic): ${err}`);
    }

    // STEP 3: Check wallet
    const wallet = await SupplierCreditWallet.findOne({
      where: { organization_id: orgId, user_id: userId },
    });

    if (!wallet) {
      throw new Error("Insufficient Credits");
    }

    if (wallet.balance < creditCost) {
      throw new Error("Insufficient Credits");
    }
    console.log("Before save:", wallet.balance);
    try {
      wallet.balance -= creditCost;
      await wallet.save();
      console.log("Wallet saved");
      console.log("New balance:", wallet.balance);
      const checkWallet = await SupplierCreditWallet.findOne({
        where: {
          organization_id: orgId,
          user_id: userId,
        },
      });

      console.log("DB balance:", checkWallet?.balance);
    } catch (walletError) {
      throw new Error(`STEP 5 FAILED (Wallet deduction): ${walletError}`);
    }
    // STEP 4: Record debit transaction for credits used
    try {
      const amountDebited = creditCost * 10; // Assuming ₦10 per credit
      await SupplierCreditTransaction.create({
        transaction_id: uuidv4(),
        organization_id: orgId,
        user_id: userId,
        document_id: documentId,
        type: "debit",
        credits: creditCost,
        credits_purchased: 0,
        amount: amountDebited,
        amount_paid: amountDebited,
        payment_reference: null,
        status: "successful",
        description: `Credits used for verifying document ${document_name}`,
        balance_after: wallet.balance,
        metadata: { document_id: documentId, document_name },
      });

    } catch (txnError) {
      console.error("❌ STEP 4 FAILED (Transaction creation):", txnError);
      throw new Error(`Transaction creation failed: ${txnError}`);
    }

    // STEP 4: Call Verification API
    try {
      if (document_name === "tax_identification_file") {
        response = await axios.post(
          `${MONO_DOCS_BASE_URL}/lookup/tin`,
          { tin: section_number },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "mono-sec-key": MONO_SECRET_KEY,
            },
          },
        );
      } else if (document_name === "national_identity_file") {
        response = await axios.post(
          `${MONO_DOCS_BASE_URL}/lookup/nin`,
          { nin: section_number },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "mono-sec-key": MONO_SECRET_KEY,
            },
          },
        );
      } else if (document_name === "bank_verification_file") {
        response = await axios.post(
          `${MONO_DOCS_BASE_URL}/lookup/bvn/initiate`,
          { bvn: section_number },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "mono-sec-key": MONO_SECRET_KEY,
            },
          },
        );
      } else {
        throw new Error(
          "Verification API not implemented for this document type",
        );
      }
    } catch (apiError: any) {
      console.error(
        "❌ STEP 4 FAILED (External API Error):",
        apiError?.response?.data || apiError.message,
      );

      const errorMessage =
        apiError?.response?.data?.message || apiError.message;

      const failedUpdatePayload: any = {
        is_verified: false,
        verified_at: new Date(),
        credits_used: creditCost,
      };

      if (userType === "admin") {
        failedUpdatePayload.admin_status = "rejected";
      } else {
        failedUpdatePayload.status = "rejected";
      }

      await SupplierDocument.update(failedUpdatePayload, {
        where: { id: documentId },
      });

      throw new Error(errorMessage);
    }

    const result = response.data;

    // STEP 6: Update document
    try {
      const updatePayload: any = {
        is_verified: result?.status === "success",
        verified_at: new Date(),
        credits_used: creditCost,
      };

      if (userType === "admin") {
        updatePayload.admin_status =
          result?.status === "success" ? "verified" : "rejected";
      } else {
        updatePayload.status =
          result?.status === "success" ? "verified" : "rejected";
      }

      await SupplierDocument.update(updatePayload, {
        where: { id: documentId },
      });
    } catch (updateError) {
      throw new Error(`STEP 6 FAILED (Document update): ${updateError}`);
    }

    console.log("✅ Verification completed successfully");

    return result;
  } catch (error: any) {
    console.error("🚨 VERIFY DOCUMENT ERROR:", error.message);
    throw error; // rethrow so controller can handle
  }
}

export async function verifyMultipleDocuments(
  orgId: string,
  userId: string,
  documents: { id: string; number: string }[],
) {
  const results: any[] = [];

  for (const item of documents) {
    const { id: documentId, number } = item;
    let creditCost = 0;
    try {
      const document = await SupplierDocument.findOne({
        where: { id: documentId, organization_id: orgId },
      });

      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      await document.update({
        section_number: number,
      });

      const { document_name } = document;

      // 🔹 Credit Logic
      creditCost = 0;

      if (document_name === "company_registration_file") creditCost = 4;
      else if (document_name === "tax_identification_file") creditCost = 5;
      else if (document_name === "vat_registration_file") creditCost = 1;
      else if (document_name === "bank_verification_file") creditCost = 2;
      else if (document_name === "national_identity_file") creditCost = 5;
      else throw new Error(`Unsupported document type: ${document_name}`);

      const wallet = await SupplierCreditWallet.findOne({
        where: { organization_id: orgId, user_id: userId },
      });

      if (!wallet) throw new Error("Insufficient Credits");

      if (wallet.balance < creditCost) throw new Error("Insufficient Credits");

      wallet.balance -= creditCost;
      await wallet.save();

      const amountDebited = creditCost * 10; // ₦10 per credit
      await SupplierCreditTransaction.create({
        transaction_id: uuidv4(),
        organization_id: orgId,
        user_id: userId,
        document_id: documentId, // ✅ link transaction to document
        type: "debit",
        credits: creditCost,
        credits_purchased: 0,
        amount: amountDebited,
        amount_paid: amountDebited,
        payment_reference: null,
        status: "successful",
        description: `Credits used for verifying document ${document_name.replace(/_/g, " ").replace("file", "").trim()}`,
        balance_after: wallet.balance,
        metadata: { document_id: documentId, document_name },
      });

      // 🔹 External API Call
      let response: any;

      if (document_name === "tax_identification_file") {
        response = await axios.post(
          `${MONO_DOCS_BASE_URL}/lookup/tin`,
          { tin: number },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "mono-sec-key": MONO_SECRET_KEY,
            },
          },
        );
      } else if (document_name === "national_identity_file") {
        response = await axios.post(
          `${MONO_DOCS_BASE_URL}/lookup/nin`,
          { nin: number },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "mono-sec-key": MONO_SECRET_KEY,
            },
          },
        );
      } else if (document_name === "bank_verification_file") {
        response = await axios.post(
          `${MONO_DOCS_BASE_URL}/lookup/bvn/initiate`,
          { bvn: number },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "mono-sec-key": MONO_SECRET_KEY,
            },
          },
        );
      } else {
        response = { data: { status: "success" } }; // For static validations
      }

      const result = response.data;

      await SupplierDocument.update(
        {
          is_verified: result?.status === "success",
          status: result?.status === "success" ? "verified" : "rejected",
          verified_at: new Date(),
          credits_used: creditCost,
        },
        { where: { id: documentId } },
      );

      results.push({
        documentId,
        status: "success",
        apiResponse: result,
      });
    } catch (error: any) {
      console.log(
        "MonoDocs Error:",
        error?.response?.data || error.message
      );

      await SupplierDocument.update(
        {
          is_verified: false,
          status: "rejected",
          verified_at: new Date(),
          credits_used: creditCost,
        },
        {
          where: { id: documentId },
        }
      );

      results.push({
        documentId,
        status: "failed",
        error:
          error?.response?.data ||
          error.message,
      });
    }
  }

  return results;
}
