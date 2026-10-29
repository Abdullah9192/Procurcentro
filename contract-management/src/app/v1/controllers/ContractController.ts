import { Op } from "sequelize";
import Contract from "../../models/Contract";
import {
  addContractSignerFieldsSchema,
  addContractSignersSchema,
  createContractSchema,
  getAllContractsSchema,
  updateContractSchema,
} from "../validators/ContractValidation";
import { Request, Response } from "express";
import htmlToDocx from "html-to-docx";
import { http } from "../../services/AxiosClient";
import { BOLDSIGN_KEY, service } from "../../../config/EnvVariables";
import FormData from "form-data";
import ContractSigner from "../../models/ContractSigner";
import axios from "axios";
import ContractSignerField, {
  ContractSignerFieldType,
} from "../../models/ContractSignerField";
import {
  DocumentApi,
  DocumentSigner,
  FormField,
  Rectangle,
  SendForSign,
} from "boldsign";

import libre from "libreoffice-convert";
import { promisify } from "util";

const convertToPdf = promisify(libre.convert);
export const createContract = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // ✅ Validate request using Joi
    const { error, value } = createContractSchema.validate(req.body, {
      abortEarly: false, // collect all errors
      allowUnknown: false,
    });

    if (error) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
      return;
    }

    // ✅ Create new contract
    const contract = await Contract.create(value);

    res.status(201).json({
      message: "Contract created successfully",
      data: contract,
    });
  } catch (err: any) {
    console.error("Error creating contract:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
    return;
  }
};

export const getAllContracts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // ✅ Validate query params
    const { error, value } = getAllContractsSchema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
      return;
    }

    const { organization_id, contract_type, status, page, limit, search } =
      value;

    const whereClause: any = {};

    // ✅ Apply filters
    if (organization_id) whereClause.organization_id = organization_id;
    if (contract_type) whereClause.contract_type = contract_type;
    if (status) whereClause.status = status;

    // ✅ Apply search (on title, description, and counter_party)
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { counter_party: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // ✅ Pagination setup
    const offset = (page - 1) * limit;

    // ✅ Fetch from DB
    const { rows, count } = await Contract.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      message: "Contracts fetched successfully",
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
      data: rows,
    });
  } catch (err: any) {
    console.error("Error fetching contracts:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
    return;
  }
};

export const updateContract = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // ✅ Validate input
    const { error, value } = updateContractSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
      return;
    }

    const { id } = req.params;

    // ✅ Find existing contract
    const contract = await Contract.findByPk(id);
    if (!contract) {
      res.status(404).json({ message: "Contract not found" });
      return;
    }

    // ✅ Update fields dynamically
    await contract.update(value);

    res.status(200).json({
      message: "Contract updated successfully",
      data: contract,
    });
  } catch (err: any) {
    console.error("Error updating contract:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
    return;
  }
};

export const addContractSigners = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { contractId } = req.params;

    // ✅ Validate body
    const { error, value } = addContractSignersSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
      return;
    }

    // ✅ Check contract exists
    const contract = await Contract.findByPk(contractId);
    if (!contract) {
      res.status(404).json({ message: "Contract not found" });
      return;
    }

    // ✅ Extract emails
    const requestEmails = value.signers.map((s: any) => s.email.toLowerCase());

    // ✅ Fetch existing signers
    const existingSigners = await ContractSigner.findAll({
      where: {
        contract_id: contractId,
        email: requestEmails,
      },
      attributes: ["email"],
    });

    const existingEmailSet = new Set(
      existingSigners.map((s) => s.email.toLowerCase()),
    );

    // 🧾 Console only
    if (existingEmailSet.size > 0) {
      console.warn("These signer emails already exist for this contract:", [
        ...existingEmailSet,
      ]);
    }

    // ✅ Filter new signers only
    const newSigners = value.signers.filter(
      (s: any) => !existingEmailSet.has(s.email.toLowerCase()),
    );

    // ⚠️ Nothing new
    if (newSigners.length === 0) {
      res.status(201).json({
        message: "No new signers to add",
        data: [],
      });
      return;
    }

    // ✅ Prepare signer records (FIXED)
    const signersData = newSigners.map((signer: any) => ({
      contract_id: contractId,
      name: signer.name,
      email: signer.email.toLowerCase(),
      signer_order: signer.signer_order ?? null,
      signer_type: signer.signer_type,
      status: "pending",
    }));

    // ✅ Bulk create
    const createdSigners = await ContractSigner.bulkCreate(signersData, {
      returning: true,
    });

    res.status(201).json({
      message: "Contract signers added successfully",
      data: createdSigners,
    });
  } catch (err: any) {
    console.error("Error adding contract signers:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const addContractSignerFields = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { contractId } = req.params;

    // ✅ Validate body
    const { error, value } = addContractSignerFieldsSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
      return;
    }

    // ✅ Check contract exists
    const contract = await Contract.findByPk(contractId);
    if (!contract) {
      res.status(404).json({ message: "Contract not found" });
      return;
    }

    // // ❌ Block edits if already sent
    // if (contract.boldsign_document_id) {
    //   res.status(400).json({
    //     message: "Cannot add signer fields after sending contract for signing",
    //   });
    //   return;
    // }

    const allFields: any[] = [];

    for (const signerPayload of value.signers) {
      const { signer_id, fields } = signerPayload;

      // ✅ Check signer belongs to contract
      const signer = await ContractSigner.findOne({
        where: { id: signer_id, contract_id: contractId },
      });

      if (!signer) {
        res.status(404).json({
          message: `Contract signer not found: ${signer_id}`,
        });
        return;
      }

      // ✅ Prepare fields for this signer
      const signerFields = fields.map((field: any) => ({
        contract_id: contractId,
        contract_signer_id: signer_id,
        field_type: field.field_type,
        page_no: field.page_no,
        x_position: field.x_position,
        y_position: field.y_position,
        width: field.width,
        height: field.height,
        is_required: field.is_required ?? true,
      }));

      allFields.push(...signerFields);
    }

    // ✅ Bulk insert all signer fields
    const createdFields = await ContractSignerField.bulkCreate(allFields, {
      returning: true,
    });

    res.status(201).json({
      message: "Contract signer fields added successfully",
      total_fields: createdFields.length,
      data: createdFields,
    });
  } catch (err: any) {
    console.error("Error adding contract signer fields:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const mapToBoldSignFieldType = (
  type: ContractSignerFieldType,
): FormField.FieldTypeEnum => {
  switch (type) {
    case "signature":
      return FormField.FieldTypeEnum.Signature;

    case "initials":
      return FormField.FieldTypeEnum.Initial;

    case "date":
      return FormField.FieldTypeEnum.DateSigned;

    case "name":
    case "text":
      return FormField.FieldTypeEnum.TextBox;

    case "company_stamp":
      return FormField.FieldTypeEnum.Company;

    default:
      return FormField.FieldTypeEnum.TextBox;
  }
};

export const sendDocumentBoldSign = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const contract = await Contract.findOne({
      where: { id },
      include: [
        {
          model: ContractSigner,
          as: "signers",
          include: [{ model: ContractSignerField, as: "fields" }],
        },
      ],
    });

    if (!contract) {
      res.status(404).json({ message: "Contract not found" });
      return;
    }
    if (!contract.signed_document) {
      res.status(400).json({ message: "Contract document is missing" });
      return;
    }
    if (!contract.signers || contract.signers.length === 0) {
      res.status(400).json({ message: "No signers found for this contract" });
      return;
    }

    const documentApi = new DocumentApi();
    documentApi.setApiKey(BOLDSIGN_KEY);

    // Build BoldSign signers
    const signers: DocumentSigner[] = contract.signers.map((s) => {
      const signer = new DocumentSigner();
      signer.name = s.name;
      signer.emailAddress = s.email;
      signer.signerType = DocumentSigner.SignerTypeEnum.Signer;

      signer.formFields = s.fields?.map((f) => {
        const bounds = new Rectangle();
        bounds.x = f.x_position;
        bounds.y = f.y_position;
        bounds.width = f.width > 0 ? f.width : 50;
        bounds.height = f.height > 0 ? f.height : 20;

        const field = new FormField();
        field.fieldType = mapToBoldSignFieldType(f.field_type);
        field.pageNumber = Math.max(1, f.page_no);
        field.bounds = bounds;
        field.isRequired = f.is_required ?? true;
        return field;
      });

      return signer;
    });

    const sendForSign = new SendForSign();
    sendForSign.title = contract.title;
    sendForSign.signers = signers;
    sendForSign.fileUrls = [contract.signed_document];
    sendForSign.message =
      contract.description || "Please review and sign this contract.";

    const result = await documentApi.sendDocument(sendForSign);

    // Save BoldSign document id & status
    contract.boldsign_document_id = result.documentId;
    contract.boldsign_status = "draft";
    await contract.save();

    res.status(200).json({
      message: "BoldSign document sent successfully",
      document_id: result.documentId,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("BoldSign error:", error.response?.data || error.message);
    } else if (error instanceof Error) {
      console.error("BoldSign error:", error.message);
    } else {
      console.error("BoldSign error:", error);
    }
    res.status(500).json({ message: "Failed to send BoldSign document" });
  }
};

export const prepareBoldSignDraft = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const contract = await Contract.findOne({
      where: { id },
      include: [{ model: ContractSigner, as: "signers" }],
    });

    if (!contract) {
      res.status(404).json({ message: "Contract not found" });
      return;
    }

    if (!contract.signers || contract.signers.length === 0) {
      res.status(400).json({
        message: "No signers found for this contract",
      });
      return;
    }

    // Build BoldSign signers array
    const signers = contract.signers.map((s) => ({
      Name: s.name,
      EmailAddress: s.email,
      PrivateMessage: "Please place your signature fields",
      AuthenticationType: "None",
      AuthenticationCode: "",
      EnableEmailOTP: false,
    }));

    const response = await axios.post(
      "https://api.boldsign.com/v1/document/createEmbeddedRequestUrl",
      {
        Title: contract.title,
        Message: contract.description,
        FileUrls: [contract.document],
        Signers: signers,
        ShowSendButton: true, // Allows sending from UI
        ShowSaveButton: true, // Allows save draft
        SendViewOption: "PreparePage", // Open draft with field editor
      },
      {
        headers: {
          "X-API-KEY": BOLDSIGN_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    res.status(200).json({
      message: "Draft created. Open link to configure signatures.",
      editor_url: response.data.embeddedRequestUrl,
      response: response.data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create BoldSign draft" });
  }
};

export const prepareAndSendBoldSignDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // 🔹 Fetch contract
    const contract = await Contract.findOne({
      where: { id },
      include: [{ model: ContractSigner, as: "signers" }],
    });

    if (!contract) {
      res.status(404).json({ message: "Contract not found" });
      return;
    }

    if (!contract.document) {
      res.status(400).json({ message: "Contract document is missing" });
      return;
    }

    if (!contract.signers || contract.signers.length === 0) {
      res.status(400).json({ message: "No signers found for this contract" });
      return;
    }

    if (!contract.title || contract.title.trim() === "") {
      res.status(400).json({ message: "Contract title is required" });
      return;
    }

    // 🔹 Prepare signer array for BoldSign
    const signers = contract.signers.map((s, index) => ({
      Name: s.name,
      EmailAddress: s.email,
      PrivateMessage: "Please review and sign this contract.",
      AuthenticationType: "None",
      AuthenticationCode: "",
      EnableEmailOTP: false,
      FormFields: [], // leave empty for now; user will place in editor
      SignerOrder: index + 1,
    }));

    // 🔹 Step 1: Create draft document with embedded editor
    const draftResponse = await axios.post(
      "https://api.boldsign.com/v1/document/prepare",
      {
        Title: contract.title,
        Message:
          contract.description || "Please review and sign this contract.",
        FileUrls: [contract.document],
        EnableSigningOrder: true,
        Signers: signers,
      },
      {
        headers: {
          "X-API-KEY": BOLDSIGN_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    // Save draft documentId
    contract.boldsign_document_id = draftResponse.data.response.documentId;
    await contract.save();

    // 🔹 Return embedded editor URL to frontend
    res.status(200).json({
      message: "Draft created. Open link to configure signatures.",
      documentId: draftResponse.data.response.documentId,
      editorUrl: draftResponse.data.response.sendUrl, // user drags & drops fields here
    });
  } catch (error: any) {
    console.error("BoldSign draft error:", error.response?.data || error);
    res.status(500).json({
      message: "Failed to create BoldSign draft document",
    });
  }
};

// 🔹 Step 2: Call this after user finishes placing signatures
export const sendBoldSignDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const contract = await Contract.findOne({ where: { id } });
    if (!contract || !contract.boldsign_document_id) {
      res.status(400).json({ message: "No draft document found to send" });
      return;
    }

    // Send the draft
    const sendResponse = await axios.post(
      "https://api.boldsign.com/v1/document/draftSend",
      { documentId: contract.boldsign_document_id },
      { headers: { "X-API-KEY": BOLDSIGN_KEY } },
    );

    res.status(200).json({
      message: "BoldSign document sent successfully",
      boldsign_document_id: contract.boldsign_document_id,
      response: sendResponse.data,
    });
  } catch (error: any) {
    console.error("BoldSign send error:", error.response?.data || error);
    res.status(500).json({
      message: "Failed to send BoldSign document",
    });
  }
};

// generateDoc
export const generateDoc = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { html, fileName } = req.body;

    if (!html || html.trim() === "") {
      res.status(400).json({ message: "HTML content is required" });
      return;
    }

    // 1. Convert HTML to DOCX buffer
    const buffer = await htmlToDocx(html, {
      title: "Generated Document",
      margins: { top: 720, right: 720, bottom: 720, left: 720 },
    });

    // 2. Prepare FormData to send to admin service
    const formData = new FormData();
    const finalFileName = `${fileName?.trim() || "contract"}`;
    formData.append("file", buffer, {
      filename: finalFileName,
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // 3. Send POST request to admin-service /azure-file endpoint using axios
    const response = await http.post(
      `${service.ADMIN_SERVICE_URL}/v1/azure-file`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    // 4. Return the Azure URL to client
    res.status(200).json({
      message: "Document generated and uploaded successfully",
      url: response,
    });
  } catch (error: any) {
    console.error("DOCX generation/upload error:", error);
    res.status(500).json({
      message: "Failed to generate and upload DOCX",
      error: error.message,
    });
  }
};

export const convertDocToPdf = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { contract_id } = req.params;

    const { docUrl, fileName } = req.body;

    if (!docUrl) {
      res.status(400).json({ message: "Document URL is required" });
      return;
    }

    const contract = await Contract.findByPk(contract_id);
    if (!contract) {
      res.status(404).json({ message: "Contract not found" });
      return;
    }

    // 1️⃣ Download DOC/DOCX file
    const docResponse = await axios.get(docUrl, {
      responseType: "arraybuffer",
    });

    const docBuffer = Buffer.from(docResponse.data);

    // 2️⃣ Convert DOC/DOCX → PDF
    const pdfBuffer = (await convertToPdf(
      docBuffer,
      ".pdf",
      undefined,
    )) as Buffer;

    // 3️⃣ Upload PDF to admin-service (Azure)
    const formData = new FormData();
    const finalFileName = `${fileName || "contract"}.pdf`;

    formData.append("file", pdfBuffer, {
      filename: finalFileName,
      contentType: "application/pdf",
    });

    const uploadResponse = await http.post(
      `${service.ADMIN_SERVICE_URL}/v1/azure-file`,
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    const pdfUrl =
      typeof uploadResponse.data.data === "string"
        ? uploadResponse.data.data
        : null;

    if (!pdfUrl) {
      throw new Error(
        `PDF upload failed, unexpected response: ${JSON.stringify(uploadResponse.data)}`,
      );
    }

    // 4️⃣ Update DB
    await contract.update({
      signed_document: pdfUrl, // always string
    });
    // 4️⃣ Return PDF URL
    res.status(200).json({
      message: "PDF generated and uploaded successfully",
      url: pdfUrl,
    });
  } catch (error: any) {
    console.error("DOC to PDF conversion error:", error);
    res.status(500).json({
      message: "Failed to convert document to PDF",
      error: error.message,
    });
  }
};

export const getContractById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // ✅ Validate ID format (UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({
        message: "Invalid contract ID format. Must be a valid UUID.",
      });
      return;
    }

    // ✅ Find contract by ID
    const contract = await Contract.findOne({
      where: { id },
      include: [
        {
          model: ContractSigner,
          as: "signers",
          attributes: [
            "id",
            "name",
            "email",
            "signer_order",
            "status",
            "signer_type",
            "created_at",
          ],
          include: [
            {
              model: ContractSignerField,
              as: "fields",
              attributes: [
                "id",
                "field_type",
                "page_no",
                "x_position",
                "y_position",
                "width",
                "height",
                "boldsign_field_id",
                "is_required",
              ],
            },
          ],
          order: [["signer_order", "ASC"]],
        },
      ],
    });

    if (!contract) {
      res.status(404).json({ message: "Contract not found" });
      return;
    }

    // ✅ Return the found contract
    res.status(200).json({
      message: "Contract fetched successfully",
      data: contract,
    });
  } catch (err: any) {
    console.error("Error fetching contract:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
    return;
  }
};
