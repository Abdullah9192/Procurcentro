import { Auction, AuctionBid } from "./index";

export const defineModelAssociations = () => {
  Auction.hasMany(AuctionBid, { foreignKey: "auction_id", as: "bids" });
  AuctionBid.belongsTo(Auction, { foreignKey: "auction_id", as: "auction" });
};
