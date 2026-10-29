import ExternalRequisitionItem from "./ExternalRequisitionItem";
import ExternalRequisitionItemAttachment from "./ExternalRequisitionItemAttachment";
import ExternalRequisitionService from "./ExternalRequisitionService";
import ExternalRequisitionServiceAttachment from "./ExternalRequisitionServiceAttachment";
import InternalRequisitionServiceAttachment from "./IneterRequisitionServiceAttachment";
import InternalRequisitionItem from "./InternalRequisitionItem";
import InternalRequisitionItemAttachment from "./InternalRequisitionItemAttachment";
import InternalRequisitionService from "./InternalRequisitionService";
import Requisition from "./Requisition";

export const defineModelAssociations = () => {
  // Requisition has many InternalRequisitionItems
  Requisition.hasMany(InternalRequisitionItem, {
    foreignKey: 'requisition_id',
    as: 'internal_items',
  });

   Requisition.hasMany(ExternalRequisitionItem, {
    foreignKey: 'requisition_id',
    as: 'external_items',
  });

  ExternalRequisitionItem.hasMany(ExternalRequisitionItemAttachment, {
    foreignKey: 'external_requisition_item_id',
    as: 'external_item_attachments',
  });

  
  InternalRequisitionItem.belongsTo(Requisition, {
    foreignKey: 'requisition_id',
    as: 'requisition',
  });

  // InternalRequisitionItem has many Attachments
  InternalRequisitionItem.hasMany(InternalRequisitionItemAttachment, {
    foreignKey: 'internal_requisition_item_id',
    as: 'attachments',
  });


  InternalRequisitionItemAttachment.belongsTo(InternalRequisitionItem, {
    foreignKey: 'internal_requisition_item_id',
    as: 'requisition_item',
  });

  ExternalRequisitionItem.belongsTo(Requisition, {
    foreignKey: 'requisition_id',
    as: 'requisition',
  });

  // InternalRequisitionItem has many Attachments
  ExternalRequisitionItem.hasMany(ExternalRequisitionItemAttachment, {
    foreignKey: 'external_requisition_item_id',
    as: 'attachments',
  });
  ExternalRequisitionItemAttachment.belongsTo(ExternalRequisitionItem, {
    foreignKey: 'external_requisition_item_id',
    as: 'requisition_item',
  });

  // External Requisition has many service
  Requisition.hasMany(ExternalRequisitionService, {
    foreignKey: 'requisition_id',
    as: 'external_services',
  });
  ExternalRequisitionService.belongsTo(Requisition, {
    foreignKey: 'requisition_id',
    as: 'requisition',
  });

  // External Requisition service has many Attachments
  ExternalRequisitionService.hasMany(ExternalRequisitionServiceAttachment, {
    foreignKey: 'external_requisition_service_id',
    as: 'attachments',
  });
  ExternalRequisitionServiceAttachment.belongsTo(ExternalRequisitionService, {
    foreignKey: 'external_requisition_service_id',
    as: 'requisition_service',
  });


  // Internal Requisition has many service
  Requisition.hasMany(InternalRequisitionService, {
    foreignKey: 'requisition_id',
    as: 'internal_services',
  });
  InternalRequisitionService.belongsTo(Requisition, {
    foreignKey: 'requisition_id',
    as: 'requisition',
  });

  // Internal Requisition service has many Attachments
  InternalRequisitionService.hasMany(InternalRequisitionServiceAttachment, {
    foreignKey: 'internal_requisition_service_id',
    as: 'attachments',
  });
  InternalRequisitionServiceAttachment.belongsTo(InternalRequisitionService, {
    foreignKey: 'internal_requisition_service_id',
    as: 'requisition_services',
  });


};
