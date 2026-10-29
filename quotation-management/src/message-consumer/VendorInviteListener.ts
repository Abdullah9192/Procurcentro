// import { consumeQueue } from "../rabbitmq/Consumer";
// import { RBT_VENDOR_QUEUES } from "../rabbitmq/Queues";
// import SupplierContact from "../app/models/SupplierContact";
// import SupplierInfo from "../app/models/SupplierInfo";
// import AppDataSource from "../config/DatabaseSource";

// interface SupplierInviteMessage {
//   event: string;
//   data: {
//     contacts: any[];
//     infos: any[];
//   };
// }

// export const listenToVendorInviteQueue = async () => {
//   await consumeQueue(
//     RBT_VENDOR_QUEUES.VENDOR_INVITE_QUEUE,
//     async (message: SupplierInviteMessage) => {
//       try {
//         console.log("🚀 Received Message:", message);

//         const { event, data } = message;

//         if (event !== "invite_suppliers") {
//           console.warn(`⚠️ Unknown event type: ${event}`);
//           return;
//         }

//         const { contacts, infos } = data;

//         if (!Array.isArray(contacts) || !Array.isArray(infos)) {
//           console.error("Invalid payload structure");
//           return;
//         }

//         await AppDataSource.transaction(async (t) => {
//           if (contacts.length > 0) {
//             await SupplierContact.bulkCreate(contacts, { transaction: t });
//           }

//           if (infos.length > 0) {
//             await SupplierInfo.bulkCreate(infos, { transaction: t });
//           }
//         });

//         console.log(`✅ Successfully processed ${contacts.length} suppliers`);
//       } catch (err) {
//         console.error("❌ Error processing invite_suppliers message:", err);
//       }
//     }
//   );
// };
