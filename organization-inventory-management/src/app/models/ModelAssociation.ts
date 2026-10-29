import OrgItem from "./OrgItem";
import OrgItemImage from "./OrgItemImage";
import OrgItemLocation from "./OrgItemLocation";

export const defineModelAssociations = () => {
  // OrgItem Associations
  OrgItem.hasMany(OrgItemImage, {
    foreignKey: "org_item_id",
    as: "images",
  });
  OrgItem.hasMany(OrgItemLocation, {
    foreignKey: "org_item_id",
    as: "locations",
  });

  // OrgItemImage Associations
  OrgItemImage.belongsTo(OrgItem, {
    foreignKey: "org_item_id",
    as: "org_item",
  });

  // OrgItemLocation Associations
  OrgItemLocation.belongsTo(OrgItem, {
    foreignKey: "org_item_id",
    as: "org_item",
  });
};
