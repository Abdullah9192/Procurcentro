import { BOLDSIGN_KEY } from "../../config/EnvVariables";
import OrderContract from "../models/OrderContract";
import OrderContractSigner from "../models/OrderContractSigner";
import OrderContractSignerField from "../models/OrderContractSignerField";
import {
  DocumentApi,
  DocumentSigner,
  FormField,
  Rectangle,
  SendForSign,
} from "boldsign";
import { mapToBoldSignFieldType } from "../v1/controllers/ContractController";
import { Transaction, QueryTypes } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

export const executeCreateOrderContract = async (
  payload: any,
  user: any,
  transaction: Transaction
) => {
  const contract = await OrderContract.create(
    {
      purchase_order_id: payload.purchase_order_id,
      organization_id: user.organization_id,

      document: payload.document,

      organization_signed: false,
      supplier_signed: false,

      status: "draft",
    },
    {
      transaction,
    }
  );

  for (const signer of payload.signers) {
    const createdSigner = await OrderContractSigner.create(
      {
        order_contract_id: contract.id,

        name: signer.name,
        email: signer.email,

        type: signer.type,
        signer_order: signer.signer_order,
      },
      {
        transaction,
      }
    );

    const fields = signer.fields.map((field: any) => ({
      order_contract_id: contract.id,

      order_contract_signer_id: createdSigner.id,

      field_type: field.field_type,

      page_no: field.page_no,

      x_position: field.x_position,
      y_position: field.y_position,

      width: field.width,
      height: field.height,

      is_required: field.is_required,
    }));

    await OrderContractSignerField.bulkCreate(fields, {
      transaction,
    });
  }

  return {
    success: true,
    statusCode: 201,
    message: "Order contract created successfully",
    data: contract,
  };
};

export const executeSendOrderContractBoldSign = async (
  contractId: string,
  user: any
) => {
  const contract =
    await OrderContract.findOne({
      where: {
        id: contractId,
      },
      include: [
        {
          model: OrderContractSigner,
          as: "signers",
          include: [
            {
              model: OrderContractSignerField,
              as: "fields",
            },
          ],
        },
      ],
    });

  if (!contract) {
    return {
      success: false,
      statusCode: 404,
      message: "Order contract not found",
    };
  }

  if (!contract.document) {
    return {
      success: false,
      statusCode: 400,
      message: "Contract document is missing",
    };
  }

  if (
    !contract.signers ||
    contract.signers.length === 0
  ) {
    return {
      success: false,
      statusCode: 400,
      message: "No signers found",
    };
  }

  const documentApi = new DocumentApi();

  documentApi.setApiKey(BOLDSIGN_KEY);

  const signers: DocumentSigner[] =
    contract.signers.map((s: any) => {
      const signer = new DocumentSigner();

      signer.name = s.name;
      signer.emailAddress = s.email;
      signer.signerType =
        DocumentSigner.SignerTypeEnum.Signer;

      signer.signerOrder = s.signer_order;

      signer.formFields = s.fields?.map((f: any) => {
        const bounds = new Rectangle();

        bounds.x = f.x_position;
        bounds.y = f.y_position;
        bounds.width =
          f.width > 0 ? f.width : 50;
        bounds.height =
          f.height > 0 ? f.height : 20;

        const field = new FormField();

        field.fieldType =
          mapToBoldSignFieldType(
            f.field_type
          );

        field.pageNumber =
          Math.max(1, f.page_no);

        field.bounds = bounds;

        field.isRequired =
          f.is_required ?? true;

        return field;
      });

      return signer;
    });

  const sendForSign =
    new SendForSign();

  sendForSign.title =
    `PO Contract ${contract.id}`;

  sendForSign.signers = signers;

  sendForSign.fileUrls = [
    contract.document,
  ];

  const result =
    await documentApi.sendDocument(
      sendForSign
    );

  await contract.update({
    boldsign_document_id:
      result.documentId,

    status: "sent",

    organization_signed: true,
  });

  // Update orders.admin_status = 'signed'
  await AppDataSource.query(
    `
  UPDATE orders
  SET admin_status = :adminStatus
  WHERE id = :purchaseOrderId
  `,
    {
      replacements: {
        adminStatus: "signed",
        purchaseOrderId: contract.purchase_order_id,
      },
      type: QueryTypes.UPDATE,
    }
  );

  return {
    success: true,
    statusCode: 200,
    message:
      "Document sent successfully",
    data: {
      document_id:
        result.documentId,
    },
  };
};

// export const executeBoldSignWebhook = async (
//   payload: any
// ) => {
//   console.log(
//     "BoldSign Webhook Payload:",
//     JSON.stringify(payload, null, 2)
//   );

//   const documentId =
//     payload?.document?.documentId ||
//     payload?.documentId;

//   if (!documentId) {
//     return;
//   }

//   const contract =
//     await OrderContract.findOne({
//       where: {
//         boldsign_document_id: documentId,
//       },
//     });

//   if (!contract) {
//     return;
//   }

//   // We'll inspect actual webhook payload first
//   return contract;
// };

export const executeBoldSignWebhook = async (
  payload: any
) => {
  try {
    console.log(
      "================ BOLDSIGN WEBHOOK START ================"
    );

    console.log(
      "Webhook Payload:",
      JSON.stringify(payload, null, 2)
    );

    const documentId =
      payload?.document?.documentId ||
      payload?.documentId ||
      payload?.data?.documentId;

    const completedSigners =
      payload?.data?.signerDetails?.filter(
        (s: any) => s.status === "Completed"
      ) || [];

    const eventType =
      payload?.event?.eventType ||
      payload?.eventType ||
      payload?.data?.eventType;

    console.log("Document ID:", documentId);
    console.log(
      "Completed Signers:",
      JSON.stringify(completedSigners, null, 2)
    );
    console.log("Event Type:", eventType);

    if (!documentId) {
      console.log(
        "No documentId found in webhook payload"
      );
      return;
    }

    const contract = await OrderContract.findOne({
      where: {
        boldsign_document_id: documentId,
      },
    });

    if (!contract) {
      console.log(
        `No OrderContract found for documentId: ${documentId}`
      );
      return;
    }

    console.log(
      "Order Contract Found:",
      contract.id
    );

    if (!completedSigners.length) {
      console.log(
        "No completed signers found in webhook payload"
      );
      return contract;
    }

    // Only process signing events
    if (
      eventType &&
      ![
        "Signed",
        "DocumentCompleted",
      ].includes(eventType)
    ) {
      console.log(
        `Ignoring event type: ${eventType}`
      );
      return contract;
    }

    const updatePayload: any = {};

    for (const signerInfo of completedSigners) {
      console.log(
        "Processing signer:",
        signerInfo.signerEmail
      );

      const signer =
        await OrderContractSigner.findOne({
          where: {
            order_contract_id: contract.id,
            email: signerInfo.signerEmail,
          },
        });

      if (!signer) {
        console.log(
          `No signer found for email: ${signerInfo.signerEmail}`
        );
        continue;
      }

      console.log(
        "Signer Found:",
        JSON.stringify(
          {
            id: signer.id,
            email: signer.email,
            type: signer.type,
          },
          null,
          2
        )
      );

      if (
        signer.type === "organization" &&
        !contract.organization_signed
      ) {
        updatePayload.organization_signed = true;

        console.log(
          "Organization signer completed signing"
        );
      }

      if (
        signer.type === "supplier" &&
        !contract.supplier_signed
      ) {
        updatePayload.supplier_signed = true;

        console.log(
          "Supplier signer completed signing"
        );
      }
    }

    // Update signer flags
    if (Object.keys(updatePayload).length) {
      await contract.update(updatePayload);

      await contract.reload();

      console.log(
        "Contract Updated:",
        JSON.stringify(
          {
            organization_signed:
              contract.organization_signed,
            supplier_signed:
              contract.supplier_signed,
          },
          null,
          2
        )
      );
    }

    console.log(
      "Current Contract Status:",
      {
        organization_signed:
          contract.organization_signed,
        supplier_signed:
          contract.supplier_signed,
      }
    );

    // Both signed
    if (
      contract.organization_signed &&
      contract.supplier_signed
    ) {
      await contract.update({
        status: "completed",
      });

      console.log(
        "Contract marked as COMPLETED"
      );
    }
    // One signer completed
    else if (
      contract.organization_signed ||
      contract.supplier_signed
    ) {
      await contract.update({
        status: "sent",
      });

      console.log(
        "Contract remains SENT (one signer completed)"
      );
    }

    await contract.reload();

    console.log(
      "Final Contract State:",
      JSON.stringify(
        {
          id: contract.id,
          status: contract.status,
          organization_signed:
            contract.organization_signed,
          supplier_signed:
            contract.supplier_signed,
        },
        null,
        2
      )
    );

    console.log(
      "================ BOLDSIGN WEBHOOK END ================"
    );

    return contract;
  } catch (error: any) {
    console.error(
      "BoldSign Webhook Error:",
      error
    );

    throw error;
  }
};

export const executeDownloadOrderContract = async (
  purchaseOrderId: string
) => {
  const contract = await OrderContract.findOne({
    where: {
      purchase_order_id: purchaseOrderId,
    },
  });

  if (!contract) {
    return {
      success: false,
      statusCode: 404,
      message: "Order contract not found",
    };
  }

  if (!contract.boldsign_document_id) {
    return {
      success: false,
      statusCode: 400,
      message: "BoldSign document not found",
    };
  }

  const documentApi = new DocumentApi();
  documentApi.setApiKey(BOLDSIGN_KEY!);

  const file = await documentApi.downloadDocument(
    contract.boldsign_document_id,
    null
  );
  console.log(file);

  return {
    success: true,
    statusCode: 200,
    file,
  };
};