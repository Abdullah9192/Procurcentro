import ClauseLibrary from "./ClauseLibrary";
import ClauseLibraryVariation from "./ClauseLibraryVariation";
import Contract from "./Contract";
import ContractSigner from "./ContractSigner";
import ContractSignerField from "./ContractSignerField";
import OrderContract from "./OrderContract";
import OrderContractSigner from "./OrderContractSigner";
import OrderContractSignerField from "./OrderContractSignerField";

export const defineModelAssociations = () => {
  // ClauseLibrary → ClauseLibraryVariation (One-to-Many)
  ClauseLibrary.hasMany(ClauseLibraryVariation, {
    foreignKey: "clause_library_id",
    as: "variations",
    onDelete: "CASCADE",
  });

  ClauseLibraryVariation.belongsTo(ClauseLibrary, {
    foreignKey: "clause_library_id",
    as: "clause_library",
  });

  Contract.hasMany(ContractSigner, {
    foreignKey: "contract_id",
    as: "signers",
  });

  ContractSigner.belongsTo(Contract, {
    foreignKey: "contract_id",
    as: "contract",
  });

  ContractSigner.hasMany(ContractSignerField, {
    foreignKey: "contract_signer_id",
    as: "fields",
  });

  ContractSignerField.belongsTo(ContractSigner, {
    foreignKey: "contract_signer_id",
    as: "signer",
  });

  ContractSignerField.belongsTo(Contract, {
    foreignKey: "contract_id",
    as: "contract",
  });

  // OrderContract -> OrderContractSigner
OrderContract.hasMany(OrderContractSigner, {
  foreignKey: "order_contract_id",
  as: "signers",
});

OrderContractSigner.belongsTo(OrderContract, {
  foreignKey: "order_contract_id",
  as: "contract",
});

// OrderContract -> OrderContractSignerField
OrderContract.hasMany(OrderContractSignerField, {
  foreignKey: "order_contract_id",
  as: "signer_fields",
});

OrderContractSignerField.belongsTo(OrderContract, {
  foreignKey: "order_contract_id",
  as: "contract",
});

// OrderContractSigner -> OrderContractSignerField
OrderContractSigner.hasMany(OrderContractSignerField, {
  foreignKey: "order_contract_signer_id",
  as: "fields",
});

OrderContractSignerField.belongsTo(OrderContractSigner, {
  foreignKey: "order_contract_signer_id",
  as: "signer",
});
};
