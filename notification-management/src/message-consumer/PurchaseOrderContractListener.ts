import { consumeQueue } from "../rabbitmq/Consumer";
import { sendEmail } from "../app/utils/general/MailerUtils";
import { RBT_VENDOR_QUEUES } from "../rabbitmq/Queues";
import { vendorEvents } from "../rabbitmq/Events";
import { sendPurchaseOrderContractTemplate } from "../app/utils/emails/templates/PurchaseOrderUtils";

interface PurchaseOrderContractMessage {
    event: string;
    data: {
        email: string;
        receiver_name?: string;
        sender_name?: string;
        purchase_order_name?: string;
        organization_name?: string;
        vendor_name?: string;
        notes?: string;
    };
}

export const listenToPurchaseOrderContractEmailQueue = async () => {
    await consumeQueue(
        RBT_VENDOR_QUEUES.PURCHASE_ORDER_CONTRACT_QUEUE,
        async (message: PurchaseOrderContractMessage) => {
            console.log(
                "purchase order contract email message",
                message
            );

            const { event, data } = message;

            if (
                event !==
                vendorEvents.send_purchase_order_contract_email
            ) {
                console.warn(
                    "Skipping unknown event:",
                    event
                );
                return;
            }

            const {
                email,
                receiver_name,
                sender_name,
                purchase_order_name,
                organization_name,
                vendor_name,
                notes,
            } = data;

            const html =
                sendPurchaseOrderContractTemplate({
                    receiver_name,
                    sender_name,
                    purchase_order_name,
                    organization_name,
                    vendor_name,
                    notes,
                });

            await sendEmail({
                to: email,
                subject: `Purchase Order Contract${purchase_order_name
                        ? ` - ${purchase_order_name}`
                        : ""
                    }`,
                html,
            });

            console.log(
                "Purchase order contract email sent:",
                email
            );
        }
    );
};