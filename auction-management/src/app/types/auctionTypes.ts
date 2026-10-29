import { AuctionAttributes } from "../models/AuctionModel";

export interface GetAuctionQuery {
  subsidiary_id?: string;
  status?: string;
  page?: number;
  limit?: number;
  name?: string;
  category?: string;
}

export interface CategoryAttributes {
  id: string;
  name: string;
  category_name: string;
  organization_id: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuctionWithCategory extends AuctionAttributes {
  category?: CategoryAttributes;
}

export type CreateUpdateBidAuction = {
  bid_amount: number;
  auction_id: string;
};

export interface RankInfo {
  rank: number;
  total_bidders: number;
  auction_highest_bid: number;
  user_highest_bid: number;
}