import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import { auctionStatuses, auctionStatusesList } from "../utils/constants/index";

export interface AuctionAttributes {
  id: string;
  subsidiary_id: string | null;
  name: string;
  description: string;
  image: string | null;
  auction_id: string;
  category_id: string;
  condition: string;
  from_date: Date;
  to_date: Date;
  start_bid_price: number;
  reserve_bid_price: number;
  minimum_bid_increment: number;
  maximum_bid_increment: number;
  is_bid_open: boolean;
  max_bids_per_user: number;
  department: Array<string>;
  auction_status: string;
  created_by: string | null;
  transferred_to: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuctionCreationAttributes
  extends Optional<
    AuctionAttributes,
    "id" | "subsidiary_id" | "image" | "created_by" | "createdAt" | "updatedAt"
  > {}

class AuctionModel
  extends Model<AuctionAttributes, AuctionCreationAttributes>
  implements AuctionAttributes
{
  public id!: string;
  public subsidiary_id!: string | null;
  public name!: string;
  public description!: string;
  public image!: string | null;
  public auction_id!: string;
  public category_id!: string;
  public condition!: string;
  public from_date!: Date;
  public to_date!: Date;
  public start_bid_price!: number;
  public reserve_bid_price!: number;
  public minimum_bid_increment!: number;
  public maximum_bid_increment!: number;
  public is_bid_open!: boolean;
  public max_bids_per_user!: number;
  public department!: Array<string>;
  public auction_status!: (typeof auctionStatuses)[keyof typeof auctionStatuses];
  public created_by!: string | null;
  public transferred_to!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

AuctionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subsidiary_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    auction_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    to_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    start_bid_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reserve_bid_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    minimum_bid_increment: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maximum_bid_increment: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_bid_open: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    max_bids_per_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    department: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
    },
    auction_status: {
      type: DataTypes.ENUM(...auctionStatusesList),
      defaultValue: auctionStatuses.Pending,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    transferred_to: {
      type: DataTypes.UUID,
      allowNull: true,
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
    tableName: "auctions",
    timestamps: true,
  }
);

export default AuctionModel;
