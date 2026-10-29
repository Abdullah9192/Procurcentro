import { Op, Sequelize, Transaction } from "sequelize";
import SupplierInfo from "../../models/SupplierInfo";
import SupplierBankInfo from "../../models/SupplierBankInfo";
import SupplierKyc from "../../models/SupplierKyc";
import SupplierContact from "../../models/SupplierContact";
import SupplierClientReference from "../../models/SupplierClientReference";
import SupplierLitigation from "../../models/SupplierLitigation";
import SupplierDocument, {
  SupplierDocumentCreationAttributes,
} from "../../models/SupplierDocument";
import SupplierIndustry from "../../models/SupplierIndustry";

// executeCreateSupplierSetupData
export const executeCreateSupplierSetupData = async (
  user: any,
  payload: any,
  transaction: Transaction
) => {
  try {

    const orgId = user.organization_id;

    const userId = user.id;
    const {
      supplier_basic_info,
      supplier_bank_info,
      supplier_kyc,
      supplier_contact_info,
      supplier_client_ref,
      supplier_declarations,
    } = payload;

    // 1. Create supplier basic info
    const basicInfo = await SupplierInfo.create(
      {
        ...supplier_basic_info,
        user_id: userId,
        organization_id: orgId,
      },
      { transaction }
    );
    // 2. Create bank info entries
    await SupplierBankInfo.bulkCreate(
      supplier_bank_info.map((entry: any) => ({
        ...entry,
        organization_id: orgId,
        user_id: userId,
      })),
      { transaction }
    );
    // 3. Create KYC entry
    const kycInfo = await SupplierKyc.create(
      {
        ...supplier_kyc,
        organization_id: orgId,
        user_id: userId,
      },
      { transaction }
    );
    // 4. Create contact info
    const contactInfos = await SupplierContact.bulkCreate(
      supplier_contact_info.map((contact: any) => ({
        ...contact,
        organization_id: orgId,
        user_id: userId,
      })),
      { transaction }
    );
    // 5. Create client refs
    await SupplierClientReference.bulkCreate(
      supplier_client_ref.map((client: any) => ({
        ...client,
        organization_id: orgId,
        user_id: userId,
      })),
      { transaction }
    );
    // 6. Create declaration
    await SupplierLitigation.create(
      {
        ...supplier_declarations,
        organization_id: orgId,
        user_id: userId,
      },
      { transaction }
    );
    // 7. Prepare documents for supplier_documents table
    const documents: SupplierDocumentCreationAttributes[] = [];

    // Basic info docs
    // for (const field of [
    //   "company_registration_file",
    //   "tax_identification_file",
    //   "vat_registration_file",
    //   "bank_verification_file",
    // ]) {
    //   const fileUrl = supplier_basic_info[field];
    //   if (fileUrl) {
    //     documents.push({
    //       organization_id: orgId,
    //       user_id: userId,
    //       section: "basic_info",
    //       section_id: basicInfo.id,
    //       document_name: field,
    //       file_url: fileUrl,
    //       status: "pending",
    //       is_verified: false,
    //     });
    //   }
    // }

    const basicInfoFileMapping: Record<string, string> = {
      company_registration_file: "company_registration_no",
      tax_identification_file: "tax_identification_no",
      vat_registration_file: "vat_registration_no",
      bank_verification_file: "bank_verification_no",
    };

    for (const field in basicInfoFileMapping) {
      const fileUrl = supplier_basic_info[field];
      const numberField = basicInfoFileMapping[field];


      if (fileUrl) {
        documents.push({
          organization_id: orgId,
          user_id: userId,
          section: "basic_info",
          section_id: basicInfo.id,
          section_number: supplier_basic_info[numberField],
          verified_type: "mono_docs",
          document_name: field,
          file_url: fileUrl,
          status: "pending",
          is_verified: false,
          admin_status: "pending",
        });
      }
    }


    // KYC docs
    for (const field of [
      "nsitf_cert_file",
      "itf_cert_file",
      "pencom_cert_file",
      "interim_reg_report_file",
      "proof_of_address_file",
      "tax_cert_file",
      "company_profile_file",
      "audited_accounts_file",
      "moa_file",
      "upstream_cert_file",
    ]) {
      const fileUrl = supplier_kyc[field];
      if (fileUrl) {
        documents.push({
          organization_id: orgId,
          user_id: userId,
          section: "kyc_info",
          section_id: kycInfo.id,
          section_number: null,
          verified_type: 'admin',
          document_name: field,
          file_url: fileUrl,
          status: "pending",
          is_verified: false,
          admin_status: "pending",
        });
      }
    }
    // Contact info docs
    for (let i = 0; i < supplier_contact_info.length; i++) {
      const fileUrl = supplier_contact_info[i].national_identity_file;
      const sectionId = contactInfos[i].id;

      if (fileUrl) {
        documents.push({
          organization_id: orgId,
          user_id: userId,
          section: "contact_info",
          section_id: sectionId,
          section_number: supplier_contact_info[i].national_identity_no,
          verified_type: 'mono_docs',
          document_name: "national_identity_file",
          file_url: fileUrl,
          status: "pending",
          is_verified: false,
          admin_status: "pending",
        });
      }
    }
    if (documents.length > 0) {
      await SupplierDocument.bulkCreate(documents, { transaction });
    }
    return {
      success: true,
      statusCode: 201,
      message: "Supplier data and documents saved successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error || "Failed to insert supplier setup data.",
      error,
    };
  }
};

export const executeUpdateSupplierBasicInfo = async (
  user: any,
  payload: any,
  transaction: Transaction
) => {
  try {
    const { supplier_id, ...remainingPayload } = payload;

    // Security check
    let supplierInfo = await SupplierInfo.findOne({
      where: {
        id: supplier_id,
        user_id: user.id,
        organization_id: user.organization_id,
      },
      transaction,
    });

    if (!supplierInfo) {
      return {
        success: false,
        statusCode: 404,
        message: "Supplier Info not found",
      };
    }

    const documentFields = [
      "company_registration_file",
      "tax_identification_file",
      "vat_registration_file",
      "bank_verification_file",
    ];

    const regularFields = { ...remainingPayload };
    const documentUpdates: any = {};

    documentFields.forEach((field) => {
      if (regularFields[field]) {
        documentUpdates[field] = regularFields[field];
        delete regularFields[field];
      }
    });


    if (Object.keys(regularFields).length > 0) {
      await SupplierInfo.update(regularFields, {
        where: {
          id: supplier_id,
          user_id: user.id,
          organization_id: user.organization_id,
        },
        transaction,
      });
    }

    if (Object.keys(documentUpdates).length > 0) {
      for (const [documentName, fileUrl] of Object.entries(documentUpdates)) {
        if (fileUrl) {
          const existingDoc = await SupplierDocument.findOne({
            where: {
              section: "basic_info",
              section_id: supplier_id,
              document_name: documentName,
              user_id: user.id,
              organization_id: user.organization_id,
            },
            transaction,
          });

          if (existingDoc) {
            await SupplierDocument.update(
              {
                file_url: fileUrl as string,
                status: "pending",
              },
              {
                where: { id: existingDoc.id },
                transaction,
              }
            );
          } else {
            await SupplierDocument.create(
              {
                organization_id: user.organization_id,
                user_id: user.id,
                section: "basic_info",
                section_id: supplier_id,
                section_number: null,
                verified_type: null,
                document_name: documentName,
                file_url: fileUrl as string,
                status: "pending",
                is_verified: false,
                admin_status: "pending",
              },
              { transaction }
            );
          }
        }
      }
    }

    const updatedSupplierInfo = await SupplierInfo.findOne({
      where: {
        id: supplier_id,
        user_id: user.id,
        organization_id: user.organization_id,
      },
      transaction,
    });

    const relatedDocuments = await SupplierDocument.findAll({
      where: {
        section: "basic_info",
        section_id: supplier_id,
        user_id: user.id,
        organization_id: user.organization_id,
      },
      transaction,
    });

    return {
      success: true,
      statusCode: 200,
      message: "Supplier Basic information updated successfully",
      data: {
        supplierInfo: updatedSupplierInfo,
        documents: relatedDocuments,
      },
    };
  } catch (error: any) {
    console.log("dewfwefwgrg", error);

    return {
      success: false,
      statusCode: 500,
      message: error?.message || "Failed to update supplier basic information",
      error: error,
    };
  }
};

export const executeUpdateSupplierBankInfo = async (
  user: any,
  input: any[],
  transaction: Transaction
) => {
  try {
    const processedBankInfos = [];

    const inputIds = input.filter(item => item.id).map(item => item.id);
    const inputAccountTypes = input.map(item => item.account_type);
    const existingBankInfos = await SupplierBankInfo.findAll({
      where: {
        user_id: user.id,
        organization_id: user.organization_id,
      },
      transaction,
    });

    const existingIds = existingBankInfos.map(info => info.id);
    const existingAccountTypes = existingBankInfos.map(info => info.account_type);
    const idsToDelete = existingBankInfos
      .filter(info => !inputIds.includes(info.id) && !inputAccountTypes.includes(info.account_type))
      .map(info => info.id);

    if (idsToDelete.length > 0) {
      await SupplierBankInfo.destroy({
        where: {
          id: idsToDelete,
          user_id: user.id,
          organization_id: user.organization_id,
        },
        transaction,
      });
    }
    for (const payload of input) {
      const { id, account_type, ...remainingPayload } = payload;
      const sanitizedPayload = Object.fromEntries(
        Object.entries({ account_type, ...remainingPayload }).filter(
          ([_, v]) => v !== '' && v !== null && v !== undefined
        )
      );

      if (id) {
        const bankRecord = await SupplierBankInfo.findOne({
          where: {
            id,
            user_id: user.id,
            organization_id: user.organization_id,
          },
          transaction,
        });

        if (!bankRecord) {
          processedBankInfos.push({
            id,
            success: false,
            message: `Supplier Bank Info with ID ${id} not found`,
          });
          continue;
        }

        const [_, [updated]] = await SupplierBankInfo.update(sanitizedPayload, {
          where: {
            id,
            user_id: user.id,
            organization_id: user.organization_id,
          },
          returning: true,
          transaction,
        });

        processedBankInfos.push(updated?.toJSON());
      } else {
        const existingBankInfo = await SupplierBankInfo.findOne({
          where: {
            account_type,
            user_id: user.id,
            organization_id: user.organization_id,
          },
          transaction,
        });

        if (existingBankInfo) {
          const [_, [updated]] = await SupplierBankInfo.update(sanitizedPayload, {
            where: {
              id: existingBankInfo.id,
              user_id: user.id,
              organization_id: user.organization_id,
            },
            returning: true,
            transaction,
          });

          processedBankInfos.push(updated?.toJSON());
        } else {
          const newBankInfo = await SupplierBankInfo.create(
            {
              ...sanitizedPayload,
              user_id: user.id,
              organization_id: user.organization_id,
            },
            { transaction }
          );

          processedBankInfos.push(newBankInfo?.toJSON());
        }
      }
    }

    return {
      success: true,
      statusCode: 200,
      message: 'Supplier Bank information processed successfully',
      data: {
        processedBankInfos,
      },
    };
  } catch (error: any) {
    console.error('Error while processing supplier bank info:', error?.message, error?.stack);

    return {
      success: false,
      statusCode: 500,
      message: 'Failed to process supplier bank information',
      error: error?.message,
    };
  }
};

export const executeUpdateSupplierKycInfo = async (
  user: any,
  payload: any,
  supplier_kyc_id: string,
  transaction: Transaction
) => {
  try {
    let supplierKycInfo = await SupplierKyc.findOne({
      where: {
        id: supplier_kyc_id,
        user_id: user.id,
        organization_id: user?.organization_id,
      },
      transaction,
    });

    if (!supplierKycInfo) {
      return {
        success: false,
        statusCode: 404,
        message: "Supplier KYC Info not found",
      };
    }

    const fileFields = [
      "nsitf_cert_file",
      "itf_cert_file",
      "pencom_cert_file",
      "interim_reg_report_file",
      "proof_of_address_file",
      "tax_cert_file",
      "company_profile_file",
      "audited_accounts_file",
      "moa_file",
      "upstream_cert_file",
    ];

    const regularFields = { ...payload };
    const documentUpdates: any = {};

    fileFields.forEach((field) => {
      if (regularFields[field]) {
        documentUpdates[field] = regularFields[field];
        delete regularFields[field];
      }
    });

    if (Object.keys(regularFields).length > 0) {
      await SupplierKyc.update(regularFields, {
        where: {
          id: supplier_kyc_id,
          user_id: user?.id,
          organization_id: user?.organization_id,
        },
        transaction,
      });
    }

    if (Object.keys(documentUpdates).length > 0) {
      for (const [documentName, fileUrl] of Object.entries(documentUpdates)) {
        const existingDoc = await SupplierDocument.findOne({
          where: {
            section: "kyc_info",
            section_id: supplier_kyc_id,
            document_name: documentName,
            user_id: user.id,
          },
          transaction,
        });

        if (existingDoc) {
          await SupplierDocument.update(
            {
              file_url: fileUrl as string,
              status: "pending",
            },
            {
              where: {
                id: existingDoc.id,
                user_id: user.id,
              },
              transaction,
            }
          );
        } else {
          await SupplierDocument.create(
            {
              organization_id: user.organization_id,
              user_id: user.id,
              section: "kyc_info",
              section_id: supplier_kyc_id,
              document_name: documentName,
              file_url: fileUrl as string,
              status: "pending",
              is_verified: false,
              admin_status: "pending",
            },
            { transaction }
          );
        }
      }
    }

    const updatedSupplierKycInfo = await SupplierKyc.findOne({
      where: {
        id: supplier_kyc_id,
        user_id: user.id,
        organization_id: user?.organization_id,
      },
      transaction,
    });

    const relatedDocuments = await SupplierDocument.findAll({
      where: {
        section: "kyc_info",
        section_id: supplier_kyc_id,
        user_id: user.id,
      },
      transaction,
    });

    return {
      success: true,
      statusCode: 200,
      message: "Supplier KYC information updated successfully",
      data: {
        supplierKycInfo: updatedSupplierKycInfo,
        documents: relatedDocuments,
      },
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to update supplier KYC information",
      error: error,
    };
  }
};

export const executeUpdateSupplierContact = async (
  user: any,
  input: any[],
  transaction: Transaction
) => {
  try {
    const processedContacts = [];

    const inputIds = input.filter(i => i.id).map(i => i.id);
    const existingContacts = await SupplierContact.findAll({
      where: {
        user_id: user.id,
        organization_id: user.organization_id,
      },
      transaction,
    });

    const existingIds = existingContacts.map(c => c.id);
    const idsToDelete = existingIds.filter(id => !inputIds.includes(id));
    if (idsToDelete.length > 0) {
      await SupplierContact.destroy({
        where: {
          id: idsToDelete,
          user_id: user.id,
          organization_id: user.organization_id,
        },
        transaction,
      });
      await SupplierDocument.destroy({
        where: {
          section: "contact_info",
          section_id: idsToDelete,
          user_id: user.id,
          organization_id: user.organization_id,
        },
        transaction,
      });
    }
    for (const payload of input) {
      const { id, national_identity_file, ...remainingPayload } = payload;

      if (id) {
        await SupplierContact.update(remainingPayload, {
          where: {
            id,
            user_id: user.id,
            organization_id: user.organization_id,
          },
          transaction,
        });
        if (national_identity_file) {
          const existingDoc = await SupplierDocument.findOne({
            where: {
              section: "contact_info",
              section_id: id,
              document_name: "national_identity_file",
              user_id: user.id,
              organization_id: user.organization_id,
            },
            transaction,
          });

          if (existingDoc) {
            await SupplierDocument.update(
              {
                file_url: national_identity_file,
                status: "pending",
              },
              {
                where: { id: existingDoc.id },
                transaction,
              }
            );
          } else {
            await SupplierDocument.create(
              {
                organization_id: user.organization_id,
                user_id: user.id,
                section: "contact_info",
                section_id: id,
                document_name: "national_identity_file",
                file_url: national_identity_file,
                status: "pending",
                is_verified: false,
                admin_status: "pending",
              },
              { transaction }
            );
          }
        }

        const updated = await SupplierContact.findOne({
          where: { id, user_id: user.id, organization_id: user.organization_id },
          transaction,
        });
        processedContacts.push(updated?.toJSON());
      } else {
        const newContact = await SupplierContact.create(
          {
            ...remainingPayload,
            user_id: user.id,
            organization_id: user.organization_id,
          },
          { transaction }
        );

        if (national_identity_file) {
          await SupplierDocument.create(
            {
              organization_id: user.organization_id,
              user_id: user.id,
              section: "contact_info",
              section_id: newContact.id,
              document_name: "national_identity_file",
              file_url: national_identity_file,
              status: "pending",
              is_verified: false,
              admin_status: "pending",
            },
            { transaction }
          );
        }

        processedContacts.push(newContact?.toJSON());
      }
    }

    return {
      success: true,
      statusCode: 200,
      message: "Supplier contact info processed successfully",
      data: { processedContacts },
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || "Failed to process supplier contacts",
      error,
    };
  }
};

export const executeUpdateSupplierClientReference = async (
  user: any,
  input: any[],
  transaction: Transaction
) => {
  try {
    const processedReferences = [];

    // Step 1: Extract IDs from input
    const inputIds = input.filter(i => i.id).map(i => i.id);

    // Step 2: Get all existing references
    const existingReferences = await SupplierClientReference.findAll({
      where: {
        user_id: user.id,
        organization_id: user.organization_id,
      },
      transaction,
    });

    const existingIds = existingReferences.map(ref => ref.id);

    // Step 3: Determine which to delete
    const idsToDelete = existingIds.filter(id => !inputIds.includes(id));

    if (idsToDelete.length > 0) {
      await SupplierClientReference.destroy({
        where: {
          id: idsToDelete,
          user_id: user.id,
          organization_id: user.organization_id,
        },
        transaction,
      });
    }

    // Step 4: Process input (update or create)
    for (const payload of input) {
      const { id, ...remainingPayload } = payload;

      if (id) {
        const existing = await SupplierClientReference.findOne({
          where: {
            id,
            user_id: user.id,
            organization_id: user.organization_id,
          },
          transaction,
        });

        if (!existing) {
          processedReferences.push({
            id,
            success: false,
            message: `Supplier Client Reference with ID ${id} not found`,
          });
          continue;
        }

        const [_, [updated]] = await SupplierClientReference.update(remainingPayload, {
          where: {
            id,
            user_id: user.id,
            organization_id: user.organization_id,
          },
          returning: true,
          transaction,
        });

        processedReferences.push(updated?.toJSON());
      } else {
        const newReference = await SupplierClientReference.create(
          {
            ...remainingPayload,
            user_id: user.id,
            organization_id: user.organization_id,
          },
          { transaction }
        );

        processedReferences.push(newReference?.toJSON());
      }
    }

    return {
      success: true,
      statusCode: 200,
      message: "Supplier Client Reference information processed successfully",
      data: {
        processedReferences,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: error?.message || "Failed to process supplier client reference information",
      error,
    };
  }
};

export const executeGetSupplierBasicInfo = async (user: any) => {
  try {
    const basicInfo = await SupplierInfo.findOne({
      where: {
        organization_id: user?.organization_id,
        user_id: user?.id,
      },
    });

    if (!basicInfo) {
      return {
        success: false,
        statusCode: 404,
        message: "Supplier not found",
      };
    }


    const documents = await SupplierDocument.findAll({
      where: {
        section: "basic_info",
        section_id: basicInfo.id,
        user_id: user.id,
        organization_id: user.organization_id,
      },
    });


    return {
      success: true,
      statusCode: 200,
      message: "Supplier Basic Information retrieved successfully",
      data: {
        basicInfo,
        documents,
      },
    };
  } catch (error) {
    console.error("Error in executeGetSupplierBasicInfo:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to retrieve supplier basic information",
      error,
    };
  }
};

export const executeGetSupplierBankInfo = async (user: any) => {
  const bankInfo = await SupplierBankInfo.findAll({
    where: {
      organization_id: user?.organization_id,
      user_id: user?.id,
    },
  });
  if (!bankInfo) {
    return {
      success: false,
      statusCode: 404,
      message: "Supplier bank details not found",
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Supplier Bank details retrieved successfully",
    data: bankInfo,
  };
};

export const executeGetSupplierKycInfo = async (user: any) => {
  try {
    const kycInfo = await SupplierKyc.findOne({
      where: {
        organization_id: user?.organization_id,
        user_id: user?.id,
      },
    });

    if (!kycInfo) {
      return {
        success: false,
        statusCode: 404,
        message: "Supplier KYC details not found",
      };
    }

    const documents = await SupplierDocument.findAll({
      where: {
        section: "kyc_info",
        section_id: kycInfo.id,
        user_id: user.id,
        organization_id: user.organization_id,
      },
    });

    return {
      success: true,
      statusCode: 200,
      message: "Supplier KYC details retrieved successfully",
      data: {
        kycInfo,
        documents,
      },
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to retrieve supplier KYC information",
      error: error,
    };
  }
};

export const executeGetSupplierContacts = async (user: any) => {
  try {
    const contacts = await SupplierContact.findAll({
      where: {
        organization_id: user?.organization_id,
        user_id: user?.id,
      },
    });

    if (!contacts || contacts.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "Supplier contact details not found",
      };
    }

    const contactIds = contacts.map((contact) => contact.id);
    const documents = await SupplierDocument.findAll({
      where: {
        section: "contact_info",
        section_id: contactIds,
        user_id: user.id,
        organization_id: user.organization_id,
      },
    });

    const contactsWithDocuments = contacts.map((contact) => {
      const contactDocuments = documents.filter(
        (doc) => doc.section_id === contact.id
      );
      return {
        ...contact.toJSON(),
        documents: contactDocuments,
      };
    });

    return {
      success: true,
      statusCode: 200,
      message: "Supplier contact details retrieved successfully",
      data: contactsWithDocuments,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to retrieve supplier contact information",
      error: error,
    };
  }
};

// executeGetSupplierContactsById
export const executeGetSupplierContactsById = async (user_id: string) => {
  try {
    const contacts = await SupplierContact.findAll({
      where: {
        user_id: user_id,
      },
    });

    if (!contacts || contacts.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "Supplier contact details not found",
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: "Supplier contact details retrieved successfully",
      data: contacts,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to retrieve supplier contact information",
      error: error,
    };
  }
};

export const executeGetSupplierClientReferences = async (user: any) => {
  try {
    const references = await SupplierClientReference.findAll({
      where: {
        organization_id: user?.organization_id,
        user_id: user?.id,
      },
    });

    if (!references || references.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "Supplier client references not found",
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: "Supplier client references retrieved successfully",
      data: references,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to retrieve supplier client references",
      error: error,
    };
  }
};

export const executeGetDocumentList = async (payload: any) => {
  const { page, limit, user_id, organization_id, search } = payload;
  try {
    if (!organization_id) {
      return {
        success: false,
        statusCode: 404,
        message: "Organization id is missing",
      };
    }

    if (!user_id) {
      return {
        success: false,
        statusCode: 404,
        message: "supplier id is missing",
      };
    }

    const whereCondition: any = {
      organization_id,
      user_id,
    };

    if (search) {
      whereCondition[Op.or] = [
        { document_name: { [Op.iLike]: `%${search}%` } },
        { status: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (!page && !limit) {
      const supplierDocuments: any = await SupplierDocument.findAll({
        where: whereCondition,
        order: [["created_at", "DESC"]],
      });

      return {
        success: true,
        statusCode: 200,
        message: "Supplier List fetched successfully",
        data: supplierDocuments || [],
      };
    }

    const currentPage = parseInt(page) || 1;
    const currentLimit = parseInt(limit) || 10;
    const offset = (currentPage - 1) * currentLimit;

    const { count: totalCount, rows: documentData } =
      await SupplierDocument.findAndCountAll({
        where: whereCondition,
        limit: currentLimit,
        offset,
        order: [["created_at", "DESC"]],
      });

    const totalPages = Math.ceil(totalCount / currentLimit);

    return {
      success: true,
      statusCode: 200,
      message: "Supplier Document List fetched successfully",
      data: {
        inventories: documentData || [],
        pagination: {
          currentPage,
          totalPages,
          totalCount,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      },
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
      error: err.orginal.message,
    };
  }
};

export const executeGetIndustryList = async (payload: any) => {
  const { page, limit } = payload;
  try {

    if (!page && !limit) {
      const industryList: any = await SupplierIndustry.findAll({
        order: [["created_at", "DESC"]],
      });

      return {
        success: true,
        statusCode: 200,
        message: "Supplier Industry List fetched successfully",
        data: industryList || [],
      };
    }

    const currentPage = parseInt(page) || 1;
    const currentLimit = parseInt(limit) || 10;
    const offset = (currentPage - 1) * currentLimit;

    const { count: totalCount, rows: supplierIndustryData } =
      await SupplierIndustry.findAndCountAll({
        limit: currentLimit,
        offset,
        order: [["created_at", "DESC"]],
      });

    const totalPages = Math.ceil(totalCount / currentLimit);

    return {
      success: true,
      statusCode: 200,
      message: "Supplier Industry List fetched successfully",
      data: {
        inventories: supplierIndustryData || [],
        pagination: {
          currentPage,
          totalPages,
          totalCount,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      },
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
      error: err.orginal.message,
    };
  }
};
