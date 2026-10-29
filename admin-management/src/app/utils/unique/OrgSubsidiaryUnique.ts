import Subsidiary from "../../models/Subsidiary";

export const isSubsidiaryNameUnique = async (
  name: string,
  organization_id?: string
): Promise<boolean> => {
  const existing = await Subsidiary.findOne({
    where: {
      subsidiary_name: name,
      organization_id: organization_id,
    },
  });

  return !existing;
};
