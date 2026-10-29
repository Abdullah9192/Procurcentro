import SupplierItem from "./SupplierCatalogue";
import SupplierItemImage from "./SupplierCatalogueImage";
import SupplierContact from "./SupplierContact";
import SupplierCreditTransaction from "./SupplierCreditTransaction";
import SupplierCreditWallet from "./SupplierCreditWallet";
import SupplierDocument from "./SupplierDocument";
import SupplierIndustry from "./SupplierIndustry";
import SupplierInfo from "./SupplierInfo";
import SupplierKyc from "./SupplierKyc";
export const defineModelAssociations = () => {
  SupplierItem.hasMany(SupplierItemImage, {
    foreignKey: "supplier_catalogue_id",
    as: "supplierCatalogueImages",
    onDelete: "CASCADE",
  });

  SupplierItemImage.belongsTo(SupplierItem, {
    foreignKey: "supplier_catalogue_id",
    as: "SupplierCatalogue",
  });

  SupplierItem.belongsTo(SupplierIndustry, {
    foreignKey: "supplier_category_id",
    as: "industry",
  });

  SupplierIndustry.hasMany(SupplierItem, {
    foreignKey: "supplier_category_id",
    as: "items",
  });

  //basic info (supplier info)
  SupplierInfo.hasMany(SupplierDocument, {
    foreignKey: "section_id",
    as: "basic_info_documents",
    scope: {
      section: "basic_info",
    },
    constraints: false,
  });
  SupplierDocument.belongsTo(SupplierInfo, {
    foreignKey: "section_id",
    as: "basic_info",
    constraints: false,
  });

  //contact info
  SupplierContact.hasMany(SupplierDocument, {
    foreignKey: "section_id",
    as: "contact_info_documents",
    scope: {
      section: "contact_info",
    },
    constraints: false,
  });
  SupplierDocument.belongsTo(SupplierContact, {
    foreignKey: "section_id",
    as: "contact_info",
    constraints: false,
  });

  //supplier kyc
  SupplierKyc.hasMany(SupplierDocument, {
    foreignKey: "section_id",
    as: "supplier_info_documents",
    scope: {
      section: "supplier_info",
    },
    constraints: false,
  });
  SupplierDocument.belongsTo(SupplierKyc, {
    foreignKey: "section_id",
    as: "supplier_info",
    constraints: false,
  });

  SupplierIndustry.hasMany(SupplierInfo, {
    foreignKey: "supplier_business_category_id",
    as: "infos",
  });
  SupplierInfo.belongsTo(SupplierIndustry, {
    foreignKey: "supplier_business_category_id",
    as: "supplier_industry",
    constraints: false,
  });

  SupplierDocument.hasMany(SupplierCreditTransaction, {
    foreignKey: "document_id",
    as: "transactions",
  });

  SupplierCreditTransaction.belongsTo(SupplierDocument, {
    foreignKey: "document_id",
    targetKey: "id",
    as: "document",
  });
};
