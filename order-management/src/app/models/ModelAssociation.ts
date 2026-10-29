import Order from "./Order";
import ShareOrder from "./ShareOrder";
import OrderSupplierItem from "./OrderSupplierItem";
import OrderComment from "./OrderComment";
import OrderReceiving from "./OrderReceiving";
import ClaimReturnItem from "./ClaimReturnItem";
import ClaimReturn from "./ClaimReturn";

export const defineModelAssociations = () => {
  // Order → OrderSupplierItem (1:N)
  Order.hasMany(OrderSupplierItem, {
    foreignKey: "order_id",
    as: "items",
  });
  OrderSupplierItem.belongsTo(Order, {
    foreignKey: "order_id",
    as: "order",
  });

  // Order → ShareOrder (1:N)
  Order.hasMany(ShareOrder, {
    foreignKey: "order_id",
    as: "shared_users",
  });
  ShareOrder.belongsTo(Order, {
    foreignKey: "order_id",
    as: "order",
  });

  // associations/orderAssociations.ts

  // ✅ Order ↔ Comments (1:N)
  Order.hasMany(OrderComment, {
    foreignKey: "order_id",
    as: "comments",
  });

  OrderComment.belongsTo(Order, {
    foreignKey: "order_id",
    as: "order",
  });

  // ✅ Comment ↔ Replies (self-relation)
  OrderComment.hasMany(OrderComment, {
    foreignKey: "parent_id",
    as: "replies",
  });

  OrderComment.belongsTo(OrderComment, {
    foreignKey: "parent_id",
    as: "parent",
  });

  Order.hasMany(OrderReceiving, { foreignKey: "order_id", as: "receivings" });

  OrderReceiving.belongsTo(Order, { foreignKey: "order_id", as: "order" });
};

// Order → ClaimReturn (1:N)
Order.hasMany(ClaimReturn, {
  foreignKey: "order_id",
  as: "claims",
});

ClaimReturn.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

// ClaimReturn → ClaimReturnItem (1:N)
ClaimReturn.hasMany(ClaimReturnItem, {
  foreignKey: "claim_id",
  as: "claim_items",
});

ClaimReturnItem.belongsTo(ClaimReturn, {
  foreignKey: "claim_id",
  as: "claim",
});

// ClaimReturnItem → OrderSupplierItem (N:1)
ClaimReturnItem.belongsTo(OrderSupplierItem, {
  foreignKey: "line_item_id",
  as: "order_item",
});

OrderSupplierItem.hasMany(ClaimReturnItem, {
  foreignKey: "line_item_id",
  as: "claim_items",
});
