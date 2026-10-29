import { Op, QueryTypes, WhereOptions } from "sequelize";
import { AuctionAttributes } from "../models/AuctionModel";
import { Auction, AuctionBid } from "../models/index";
import {
  AuctionWithCategory,
  CategoryAttributes,
  CreateUpdateBidAuction,
  GetAuctionQuery,
  RankInfo,
} from "../types/auctionTypes";
import { User } from "../types/userTypes";
import { paginate } from "../utils/utils";
import { getCategoriesApi } from "../v1/servicesApis/adminServiceApi";
import { auctionStatuses, bidStatuses } from "../utils/constants";
import AppDataSource from "../../config/DatabaseSource";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";

// =========== create auction
export const createAuctionRepository = async (
  user: User,
  payload: AuctionAttributes
) => {
  try {
    const lastAuction = await Auction.findOne({
      where: {
        subsidiary_id: payload.subsidiary_id,
      },
      order: [["createdAt", "DESC"]],
    });
    let nextAuctionId = "AUC/01";
    if (lastAuction && lastAuction.auction_id) {
      // extract numeric part from auction_id (e.g., "AUC/05" -> 5)
      const lastNumber =
        parseInt(lastAuction.auction_id.split("/")[1], 10) || 0;

      // increment and pad with 2 digits
      const newNumber = (lastNumber + 1).toString().padStart(2, "0");

      nextAuctionId = `AUC/${newNumber}`;
    }
    const data = {
      ...payload,
      auction_id: nextAuctionId,
      created_by: user?.id,
    };

    const result = await Auction.create(data);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

// =========== get auctions
export const getUserAuctionsRepository = async (
  user: User,
  page: number,
  limit: number,
  query: GetAuctionQuery,
  token: string | undefined
) => {
  try {
    const searchQuery: WhereOptions = {};
    if (query?.subsidiary_id) {
      searchQuery["subsidiary_id"] = query.subsidiary_id;
    }
    if (!query.subsidiary_id) {
      throw Error("Please add subsidiary id.");
    }
    if (query?.status) {
      searchQuery["auction_status"] = query.status;
    }

    if (query?.name) {
      searchQuery["name"] = {
        [Op.iLike]: `%${query.name}%`,
      };
    }
    if (query?.category) {
      searchQuery["category_id"] = query.category;
    }
    const result = await paginate(Auction, {
      where: searchQuery,
      page,
      limit,
    });
    const uniqueIds = [
      ...new Set(result.data.map((item: any) => item.category_id)),
    ];
    const userToken = token ?? "";
    const categories = await getCategoriesApi(userToken, {
      ids: uniqueIds ?? [],
      organization_id: user?.organization_id,
    });
    const auctions: AuctionWithCategory[] = result.data.map((item) => {
      const plain = item.toJSON() as AuctionAttributes;
      return {
        ...plain,
        category: categories.data.find(
          (category: CategoryAttributes) => category.id === plain.category_id
        ),
      };
    });

    // ======================
    // Extra Stats
    // ======================
    const { start: thisMonthStart, end: thisMonthEnd } = getMonthRange(0);
    const { start: lastMonthStart, end: lastMonthEnd } = getMonthRange(-1);

    // total auctions
    const thisMonthTotal = await Auction.count({
      where: {
        subsidiary_id: query.subsidiary_id,
        createdAt: { [Op.between]: [thisMonthStart, thisMonthEnd] },
      },
    });

    const lastMonthTotal = await Auction.count({
      where: {
        subsidiary_id: query.subsidiary_id,
        createdAt: { [Op.between]: [lastMonthStart, lastMonthEnd] },
      },
    });

    const totalProgress =
      lastMonthTotal === 0
        ? 100
        : ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

    // transferred auctions
    const thisMonthTransferred = await Auction.count({
      where: {
        subsidiary_id: query.subsidiary_id,
        auction_status: auctionStatuses.Transfered,
        createdAt: { [Op.between]: [thisMonthStart, thisMonthEnd] },
      },
    });

    const lastMonthTransferred = await Auction.count({
      where: {
        subsidiary_id: query.subsidiary_id,
        auction_status: auctionStatuses.Transfered,
        createdAt: { [Op.between]: [lastMonthStart, lastMonthEnd] },
      },
    });

    const subsidiaryBidCount = await AuctionBid.count({
      include: [
        {
          model: Auction,
          as: "auction",
          where: { subsidiary_id: query.subsidiary_id },
        },
      ],
    });

    const activeAuction = await Auction.count({
      where: {
        subsidiary_id: query.subsidiary_id,
        auction_status: auctionStatuses.Live,
        createdAt: { [Op.between]: [thisMonthStart, thisMonthEnd] },
      },
    });

    const transferredProgress =
      lastMonthTransferred === 0
        ? 100
        : ((thisMonthTransferred - lastMonthTransferred) /
          lastMonthTransferred) *
        100;

    return {
      stats: {
        totalAuctions: thisMonthTotal,
        totalAuctionsProgress: totalProgress, // + or - %
        transferredAuctions: thisMonthTransferred,
        transferredAuctionsProgress: transferredProgress, // + or - %
        activeAuctions: activeAuction,
        activeBids: subsidiaryBidCount,
      },
      auctions: { ...result, data: auctions },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message); // keep original message
    }
    throw new Error("An unknown error occurred"); // handle other cases
  }
};

// =========== get auction by id
export const getAutciotnByIdRepository = async (id: string) => {
  try {
    const result = await Auction.findByPk(id);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message); // keep original message
    }
    throw new Error("An unknown error occurred"); // handle other cases
  }
};

// =========== update auction
export const updateAuctionRepository = async (id: string, data: any) => {
  try {
    const auctionExists = await getAutciotnByIdRepository(id);
    if (!auctionExists) {
      throw new Error("Auction not found");
    }
    const result = await Auction.update(data, { where: { id } });
    const updateData = await getAutciotnByIdRepository(id);
    return updateData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message); // keep original message
    }
    throw new Error("An unknown error occurred"); // handle other cases
  }
};

// =========== delete auction
export const deleteAuctionRepository = async (id: string) => { };

// ======== repositories for employee

// ======== get auctions for employee
export const getAuctionsForEmployeeRepository = async (
  user: User,
  page: number,
  limit: number,
  query: GetAuctionQuery
) => {
  try {
    const searchQuery: WhereOptions = {
      subsidiary_id: user?.subsidiary_id,
    };
    if (query?.status) {
      searchQuery["auction_status"] = query.status;
    }

    if (query?.name) {
      searchQuery["name"] = {
        [Op.iLike]: `%${query.name}%`,
      };
    }
    if (query?.category) {
      searchQuery["category_id"] = query.category;
    }
    const data = await paginate(Auction, {
      where: searchQuery,
      limit,
      page,
    });

    const liveAuction = await Auction.count({
      where: {
        subsidiary_id: user?.subsidiary_id,
        auction_status: auctionStatuses.Live,
      },
    });
    const [totalBids, totalWinningBids] = await Promise.all([
      AuctionBid.count({
        where: { employee_id: user?.id },
      }),
      AuctionBid.count({
        where: {
          employee_id: user?.id,
          bid_status: bidStatuses.Winning,
        },
      }),
    ]);
    const stats = {
      liveAuctions: liveAuction,
      totalBids: totalBids,
      totalWinningBids: totalWinningBids,
    };

    return { stats, data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message); // keep original message
    }
    throw new Error("An unknown error occurred");
  }
};

export const bidOnAcutionRepository = async (
  user: User,
  payload: CreateUpdateBidAuction
) => {
  try {
    let bidStatus = "";
    // find auction
    const auction = await Auction.findOne({
      where: {
        id: payload.auction_id,
      },
    });
    if (!auction || auction.auction_status !== auctionStatuses.Live) {
      throw new Error("Auction is not live");
    }
    const maxbidPrice = await AuctionBid.findOne({
      where: {
        auction_id: payload.auction_id,
      },
      order: [["bid_amount", "DESC"]],
      raw: true,
    });
    console.log(maxbidPrice);
    // find bid exists
    const bidExists = await AuctionBid.findOne({
      where: {
        employee_id: user?.id,
        auction_id: payload.auction_id,
      },
    });
    if (bidExists) {
      bidStatus = !maxbidPrice
        ? bidStatuses.Winning
        : maxbidPrice && payload.bid_amount >= maxbidPrice.bid_amount
          ? bidStatuses.Winning
          : bidStatuses.Outbid;
      await bidExists.update({
        bid_amount: payload.bid_amount,
        bid_status: bidStatus,
      });
      const result = await AuctionBid.findOne({
        where: {
          id: bidExists.id,
        },
      });
      return result;
    }

    bidStatus = !maxbidPrice
      ? bidStatuses.Winning
      : maxbidPrice && payload.bid_amount > maxbidPrice.bid_amount
        ? bidStatuses.Winning
        : bidStatuses.Outbid;
    const bid = await AuctionBid.create({
      employee_id: user?.id,
      auction_id: payload.auction_id,
      bid_amount: payload.bid_amount,
      bid_status: bidStatus,
      bid_date: new Date(),
    });
    return bid;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

export const getAuctionBidsRepository = async (
  user: User,
  auction_id: string,
  page: number,
  limit: number,
  token: string
) => {
  try {
    const result = await paginate(AuctionBid, {
      where: { auction_id: auction_id },
      include: [{ model: Auction, as: "auction" }],
      limit,
      page,
    });
    const uniqueIds = result?.data?.length
      ? [
        ...new Set(
          result.data.map((bid: any) => bid?.employee_id).filter(Boolean)
        ),
      ]
      : [];

    const users = await http.post(
      `${service.ADMIN_SERVICE_URL}/v1/organization/get-users-by-ids`,
      {
        ids: uniqueIds,
      },
      { token }
    );
    const usersArray = users?.data?.data;
    const userMap: Record<string, any> = {};
    usersArray.forEach((user: User) => {
      if (user && user.id) {
        userMap[user.id] = user;
      }
    });

    result.data = result.data.map((bid: any) => ({
      ...bid.get({ plain: true }),
      employee: bid.employee_id ? userMap[bid.employee_id] || null : null,
    }));

    const [rankInfo] = await AppDataSource.query<RankInfo>(
      `
      SELECT ranked.rank,
             totals.total_bidders,
             totals.highest_bid   AS auction_highest_bid,
             ranked.highest_bid   AS user_highest_bid
      FROM (
        SELECT 
          employee_id,
          auction_id,
          MAX(bid_amount) AS highest_bid,
          RANK() OVER (
            PARTITION BY auction_id
            ORDER BY MAX(bid_amount) DESC
          ) AS rank
        FROM "auction_bids"
        GROUP BY employee_id, auction_id
      ) ranked
      JOIN (
        SELECT auction_id, 
               COUNT(DISTINCT employee_id) AS total_bidders,
               MAX(bid_amount) AS highest_bid
        FROM "auction_bids"
        GROUP BY auction_id
      ) totals
      ON ranked.auction_id = totals.auction_id
      WHERE ranked.employee_id = :employeeId
        AND ranked.auction_id = :auctionId;
      `,
      {
        replacements: { employeeId: user?.id, auctionId: auction_id },
        type: QueryTypes.SELECT,
      }
    );

    const stats = {
      participants: rankInfo?.total_bidders ?? 0,
      leadingBid: rankInfo?.auction_highest_bid ?? null,
      userRank: rankInfo?.rank ?? null,
      userHighestBid: rankInfo?.user_highest_bid ?? null,
    };

    return {
      stats,
      result,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message); // keep original message
    }
    throw new Error("An unknown error occurred");
  }
};

export const getMyAuctionsRepository = async (
  user: User,
  page: number,
  limit: number,
  token: string
) => {
  try {
    const offset = (page - 1) * limit;

    const auctions = await AppDataSource.query(
      `
      SELECT DISTINCT a.*
      FROM auction_bids ab
      INNER JOIN auctions a ON a.id = ab.auction_id
      WHERE ab.employee_id = :employeeId
      ORDER BY a.created_at DESC
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: {
          employeeId: user?.id,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      }
    );

    const totalCountResult: any = await AppDataSource.query(
      `
      SELECT COUNT(DISTINCT auction_id)::int AS count
      FROM auction_bids
      WHERE employee_id = :employeeId
      `,
      {
        replacements: { employeeId: user?.id },
        type: QueryTypes.SELECT,
      }
    );

    const total = totalCountResult[0]?.count ?? 0;

    return {
      data: auctions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

const getMonthRange = (offset = 0) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + offset + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
};
