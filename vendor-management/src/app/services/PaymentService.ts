import axios from "axios";
import SupplierCreditWallet from "../models/SupplierCreditWallet";
import SupplierCreditTransaction from "../models/SupplierCreditTransaction";
import { successResponse } from "../utils/general/ResponseUtils";
import { v4 as uuidv4 } from "uuid";

const MONO_API = "https://api.withmono.com/v2";
const MONO_SECRET = process.env.MONO_SECRET_KEY!;

// 1 Credit = ₦10
const CREDIT_VALUE = 10;

/**
 * Initiates a payment request on Mono
 */
export async function initiateMonoPayment(
  orgId: string,
  userId: string,
  amountNaira: number
) {
  try {
    const amountKobo = amountNaira * 100; // Mono expects Kobo (smallest unit)
    const reference = `txn_${uuidv4()}`;

    const payload = {
      amount: amountKobo,
      type: "onetime-debit",
      method: "transfer", // or "transfer", "whatsapp"
      description: "Credit purchase",
      reference,
      redirect_url: "https://3161042defe4.ngrok-free.app/payments/callback",
      customer: {
        email: "customer@email.com",
        phone: "08122334455",
        address: "Lagos, Nigeria",
        identity: {
          type: "bvn", // could also be nin/passport/etc. based on docs
          number: "22110033445",
        },
        name: "John Doe",
      },
      meta: {
        orgId,
        userId,
      },
    };

    const resp = await axios.post(`${MONO_API}/payments/initiate`, payload, {
      headers: {
        "mono-sec-key": MONO_SECRET,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return {
      success: true,
      statusCode: 200,
      message: "Payment initiation successful",
      data: resp.data,
    };
  } catch (error: any) {
    console.error("Mono Payment Error:", error?.response?.data || error.message);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to initiate payment",
      error: error?.response?.data || error.message,
    };
  }
}


/**
 * Handles Mono webhook event
 */
export async function handleMonoWebhook(event: any) {

  console.log("Received Mono webhook event successfully::::::", event);
  // if (event.type !== "payment.successful")
  //   return {
  //     success: false,
  //     statusCode: 400,
  //     message: "Invalid event type",
  //   };

  // const payment = event.data;
  // const { orgId, userId } = payment.metadata;
  // const amount = payment.amount; // in Naira
  // const credits = Math.floor(amount / CREDIT_VALUE);

  // // Update wallet
  // let wallet = await SupplierCreditWallet.findOne({
  //   where: { organization_id: orgId, user_id: userId },
  // });
  // if (!wallet) {
  //   wallet = await SupplierCreditWallet.create({
  //     organization_id: orgId,
  //     user_id: userId,
  //     balance: 0,
  //   });
  // }

  // wallet.balance += credits;
  // await wallet.save();

  // // Create transaction log
  // await SupplierCreditTransaction.create({
  //   organization_id: orgId,
  //   user_id: userId,
  //   transaction_id: payment.id,
  //   type: "purchase",
  //   credits,
  //   description: `Purchased ${credits} credits`,
  //   balance_after: wallet.balance,
  // });

  return {
    success: true,
    statusCode: 200,
    message: "Credits added successfully",
    // data: credits,
  };
}
