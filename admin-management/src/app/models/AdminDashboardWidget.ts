import {
  Model,
  DataTypes,
  Optional,
  BelongsToGetAssociationMixin,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import Widget from './Widget';
import AdminPortal from './AdminPortal';

interface AdminDashboardWidgetAttributes {
  id: string;
  // widget_id: string;
  // admin_portal_id: string;
  // is_visible: boolean;
  // order: number;

  organization_id: string;
  total_spend: boolean;
  total_purchase_orders: boolean;
  average_request_to_po_time: boolean;
  budget_utilization: boolean;
  purchase_requests: boolean;
  pending_approvals: boolean;
  purchase_orders: boolean;
  receiving_status: boolean;
  invoices: boolean;
  to_do_list: boolean;
  procurement_trends: boolean;
  expenses_by_department: boolean;
  vendor_insights: boolean;
  category_analysis: boolean;
  process_efficiency: boolean;
  customized_dashboard_name: boolean;

  created_at?: Date;
  updated_at?: Date;
}

type AdminDashboardWidgetCreationAttributes = Optional<
  AdminDashboardWidgetAttributes,
  'id' | 'created_at' | 'updated_at'
>;

class AdminDashboardWidget
  extends Model<AdminDashboardWidgetAttributes, AdminDashboardWidgetCreationAttributes>
  implements AdminDashboardWidgetAttributes {
  public id!: string;
  // public widget_id!: string;
  // public admin_portal_id!: string;
  // public is_visible!: boolean;
  // public order!: number;
  public organization_id!: string;

  public total_spend!: boolean;
  public total_purchase_orders!: boolean;
  public average_request_to_po_time!: boolean;
  public budget_utilization!: boolean;
  public purchase_requests!: boolean;
  public pending_approvals!: boolean;
  public purchase_orders!: boolean;
  public receiving_status!: boolean;
  public invoices!: boolean;
  public to_do_list!: boolean;
  public procurement_trends!: boolean;
  public expenses_by_department!: boolean;
  public vendor_insights!: boolean;
  public category_analysis!: boolean;
  public process_efficiency!: boolean;
  public customized_dashboard_name!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public getWidget!: BelongsToGetAssociationMixin<Widget>;
  public getAdminPortal!: BelongsToGetAssociationMixin<AdminPortal>;
}

AdminDashboardWidget.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // widget_id: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    // },
    // admin_portal_id: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    // },
    // is_visible: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue: true,
    // },
    // order: {
    //   type: DataTypes.INTEGER,
    //   defaultValue: 0,
    // },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    total_spend: { type: DataTypes.BOOLEAN, defaultValue: false },
    total_purchase_orders: { type: DataTypes.BOOLEAN, defaultValue: false },
    average_request_to_po_time: { type: DataTypes.BOOLEAN, defaultValue: false },
    budget_utilization: { type: DataTypes.BOOLEAN, defaultValue: false },
    purchase_requests: { type: DataTypes.BOOLEAN, defaultValue: false },
    pending_approvals: { type: DataTypes.BOOLEAN, defaultValue: false },
    purchase_orders: { type: DataTypes.BOOLEAN, defaultValue: false },
    receiving_status: { type: DataTypes.BOOLEAN, defaultValue: false },
    invoices: { type: DataTypes.BOOLEAN, defaultValue: false },
    to_do_list: { type: DataTypes.BOOLEAN, defaultValue: false },
    procurement_trends: { type: DataTypes.BOOLEAN, defaultValue: false },
    expenses_by_department: { type: DataTypes.BOOLEAN, defaultValue: false },
    vendor_insights: { type: DataTypes.BOOLEAN, defaultValue: false },
    category_analysis: { type: DataTypes.BOOLEAN, defaultValue: false },
    process_efficiency: { type: DataTypes.BOOLEAN, defaultValue: false },
    customized_dashboard_name: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: AppDataSource,
    modelName: 'AdminDashboardWidget',
    tableName: 'admin_dashboard_widgets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);



export default AdminDashboardWidget;
