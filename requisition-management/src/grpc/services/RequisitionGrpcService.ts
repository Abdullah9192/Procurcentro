import * as grpc from "@grpc/grpc-js";
import Requisition from "../../app/models/Requisition";

const notFoundError = (entity: string) => ({
  code: grpc.status.NOT_FOUND,
  message: `${entity} not found`,
});

export const requisitionService = {
  GetRequisitionById: async (call: any, callback: any) => {
    const { id } = call.request;
    const requisition = await Requisition.findByPk(id);
    if (!requisition) return callback(notFoundError("Organization"));
    callback(null, {
      id: requisition.id,
      request_id: requisition.request_id,
      organization_id: requisition.organization_id,
      title: requisition.title,
      receiving_location: requisition.receiving_location,
      created_by: requisition.created_by,
      requisition_date: requisition.request_date,
      status: requisition.status,
      total_request_amount: requisition.total_request_amount,
    });
  },
};

