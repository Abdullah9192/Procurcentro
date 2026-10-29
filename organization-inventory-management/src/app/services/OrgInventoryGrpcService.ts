import {
    getUserById,
    getOrgCategoryById,
    getOrgSubCategoryById,
    getOrganizationById,
    getSubsidiaryById,
    getBranchById,
} from "../../grpc/clients/AdminGrpcClient";

export const resolveOrgInventoryRelations = async (inventory: any) => {
    const inventoryPlain = inventory.toJSON ? inventory.toJSON() : inventory;
    console.log("inventoryplain", inventoryPlain);
    const { locations } = inventoryPlain;


    const [
        organization,
        subsidiary,
        user,
        orgCategory,
        orgSubCategory,
        branchLocations,
    ] = await Promise.all([
        inventoryPlain.organization_id ?
            getOrganizationById(inventoryPlain.organization_id)
                .catch(err => {
                    console.error('Error fetching organization:', err);
                    return null;
                }) :
            Promise.resolve(null),

        inventoryPlain.subsidiary_id ?
            getSubsidiaryById(inventoryPlain.subsidiary_id)
                .catch(err => {
                    console.error('Error fetching subsidiary:', err);
                    return null;
                }) :
            Promise.resolve(null),

        inventoryPlain.user_id ?
            getUserById(inventoryPlain.user_id)
                .catch(err => {
                    console.error('Error fetching user:', err);
                    return null;
                }) :
            Promise.resolve(null),

        inventoryPlain.org_category_id ?
            getOrgCategoryById(inventoryPlain.org_category_id)
                .catch(err => {
                    console.error('Error fetching org category:', err);
                    return null;
                }) :
            Promise.resolve(null),

        inventoryPlain.org_sub_category_id ?
            getOrgSubCategoryById(inventoryPlain.org_sub_category_id)
                .catch(err => {
                    console.error('Error fetching org sub category:', err);
                    return null;
                }) :
            Promise.resolve(null),

        locations && locations.length > 0
            ? Promise.all(
                locations.map((loc: any) =>
                    getBranchById(loc?.subsidiary_branch_id).catch((err) => {
                        console.error("Error fetching branch:", err);
                        return null;
                    })
                )
            )
            : Promise.resolve([]),
    ]);

    return {
        ...inventoryPlain,
        organization,
        subsidiary,
        user,
        org_category: orgCategory,
        org_sub_category: orgSubCategory,
        org_subsidiary_branch: branchLocations,
    };
};