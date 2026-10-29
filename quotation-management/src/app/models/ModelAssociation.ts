import Quotation from "./Quotation";
import QuotationItem from "./QuotationItem";
import QuotationItemScoringResult from "./QuotationItemScoringResult";
import QuotationNegotiation from "./QuotationNegotiation";
import QuotationScoring from "./QuotationScoring";
import QuotationScoringConfiguration from "./QuotationScoringConfiguration";
import QuotationSupplier from "./QuotationSupplier";

export const defineModelAssociations = () => {
  // Quotation → QuotationItem (One-to-Many)
  Quotation.hasMany(QuotationItem, {
    foreignKey: "quotation_id", // column inside QuotationItem
    sourceKey: "id", // correct PK in Quotation
    as: "items",
    onDelete: "CASCADE",
  });

  QuotationItem.belongsTo(Quotation, {
    foreignKey: "quotation_id",
    targetKey: "id", // correct PK in Quotation
    as: "quotation",
  });

  // Quotation → QuotationSupplier (One-to-Many)
  Quotation.hasMany(QuotationSupplier, {
    foreignKey: "quotation_id",
    sourceKey: "id", // correct PK in Quotation
    as: "suppliers",
    onDelete: "CASCADE",
  });

  QuotationSupplier.belongsTo(Quotation, {
    foreignKey: "quotation_id",
    targetKey: "id",
    as: "quotation",
  });

  // Quotation scoring
  QuotationScoring.hasMany(QuotationScoringConfiguration, {
    foreignKey: "quotation_scoring_id",
    as: "configurations",
  });
  QuotationScoringConfiguration.belongsTo(QuotationScoring, {
    foreignKey: "quotation_scoring_id",
    as: "quotation_scoring",
  });

  // QuotationItemScoringResult associations
  QuotationItemScoringResult.belongsTo(QuotationScoringConfiguration, {
    foreignKey: "scoring_configuration_id",
    as: "scoring_config",
  });

  QuotationScoringConfiguration.hasMany(QuotationItemScoringResult, {
    foreignKey: "scoring_configuration_id",
    as: "scoring_results",
  });

  QuotationSupplier.hasMany(QuotationNegotiation, {
    foreignKey: "quotation_supplier_id",
    as: "negotiations",
  });

  QuotationNegotiation.belongsTo(QuotationSupplier, {
    foreignKey: "quotation_supplier_id",
    as: "quotation_supplier",
  });
};
