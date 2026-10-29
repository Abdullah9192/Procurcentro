import BackofficeUser from "../../models/backoffice-user.entity";


export const getAllUsers = async () => {
  const users = await BackofficeUser.findAll();
  return users;
};

export const getUserById = async (id: string) => {
  const user = await BackofficeUser.findOne({ where: { id } });
  if (!user) throw { statusCode: 404, message: 'User not found' };
  return user;
};
