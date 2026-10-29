import Joi from "joi";
import { auctionStatusesList } from "../../utils/constants";

export const createAuctionValidation = Joi.object({
  subsidiary_id: Joi.string().uuid().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().uri().optional().allow(null),
  category_id: Joi.string().required(),
  condition: Joi.string().required(),
  from_date: Joi.date().required(),
  to_date: Joi.date().required(),
  //   Joi.date().greater(Joi.ref("from_date")).required(),
  start_bid_price: Joi.number().integer().required(),
  reserve_bid_price: Joi.number().integer().required(),
  minimum_bid_increment: Joi.number().integer().required(),
  maximum_bid_increment: Joi.number().integer().required(),
  is_bid_open: Joi.boolean().required(),
  max_bids_per_user: Joi.number().integer().required(),
  department: Joi.array().items(Joi.string().uuid()).min(1).required(),
  auction_status: Joi.string()
    .valid(...auctionStatusesList)
    .optional(),
});

export const updateAuctionValidation = Joi.object({
  subsidiary_id: Joi.string().uuid().optional(),
  name: Joi.string().min(3).optional(),
  description: Joi.string().min(3).optional(),
  image: Joi.string().uri().optional().allow(null),
  category_id: Joi.string().optional(),
  condition: Joi.string().optional(),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional(),
  //   Joi.date().greater(Joi.ref("from_date")).required(),
  start_bid_price: Joi.number().integer().optional(),
  reserve_bid_price: Joi.number().integer().optional(),
  minimum_bid_increment: Joi.number().integer().optional(),
  maximum_bid_increment: Joi.number().integer().optional(),
  is_bid_open: Joi.boolean().optional(),
  max_bids_per_user: Joi.number().integer().optional(),
  department: Joi.array().items(Joi.string().uuid()).min(1).optional(),
  auction_status: Joi.string()
    .valid(...auctionStatusesList)
    .optional(),
  transferred_to: Joi.string().uuid().optional(),
});

export const createUpdateBidValidation = Joi.object({
  bid_amount: Joi.number().integer().required(),
  auction_id: Joi.string().uuid().required(),
});
