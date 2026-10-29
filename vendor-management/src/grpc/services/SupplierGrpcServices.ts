import * as grpc from "@grpc/grpc-js";
import SupplierContact from "../../app/models/SupplierContact";
import { http } from "../../app/services/AxiosClient";
import { service } from "../../config/EnvVariables";
import SupplierInfo from "../../app/models/SupplierInfo";
import SupplierIndustry from "../../app/models/SupplierIndustry";
export const supplierService = {
  GetSupplierById: async (call: any, callback: any) => {
    const { id } = call.request;
    const response = await http.get(`/v1/auth/get-user/${id}`, undefined, {
      baseURL: service.ADMIN_SERVICE_URL || "http://admin-service:5001",
    });
    const user = await SupplierContact.findOne({
      where: { user_id: id, is_primary: true },
    });
    const info = await SupplierInfo.findOne({
      where: { user_id: id },
      include: [
        {
          model: SupplierIndustry,
          as: "supplier_industry", // Use the alias defined in the relationship
        },
      ],
    });
    callback(null, {
      id: id,
      name: response?.data?.data?.user.name || "N/A",
      contact_phone: user?.contact_phone || "N/A",
      address: info?.address || "N/A",
      contact_phone_code: user?.contact_phone_code || "N/A",
      contact_name: user?.contact_name || "N/A",
      business_name: info?.business_name || "N/A",
      supplier_industry: info?.supplier_industry,
    });
  },
};
