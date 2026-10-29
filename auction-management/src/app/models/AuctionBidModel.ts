import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import { bidStatuses, bidStatusesList } from "../utils/constants/index";

export interface BidAttributes {
  id: string;
  employee_id: string | null;
  bid_amount: number;
  bid_date: Date;
  auction_id: string;
  bid_status: (typeof bidStatuses)[keyof typeof bidStatuses];
  createdAt: Date;
  updatedAt: Date;
}

interface BidCreationAttributes
  extends Optional<
    BidAttributes,
    "id" | "employee_id" | "bid_date" | "createdAt" | "updatedAt"
  > {}

class AuctionBidsModel
  extends Model<BidAttributes, BidCreationAttributes>
  implements BidAttributes
{
  public id!: string;
  public employee_id!: string | null;
  public bid_amount!: number;
  public bid_date!: Date;
  public auction_id!: string;
  public bid_status!: (typeof bidStatuses)[keyof typeof bidStatuses];
  public createdAt!: Date;
  public updatedAt!: Date;
}

AuctionBidsModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    bid_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bid_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    auction_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    bid_status: {
      type: DataTypes.ENUM(...Object.values(bidStatuses)),
      defaultValue: bidStatuses.Outbid,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: AppDataSource,
    tableName: "auction_bids",
    timestamps: true,
  }
);

export default AuctionBidsModel;
