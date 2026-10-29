import bcrypt from 'bcryptjs';
import BackofficeUser from '../../models/backoffice-user.entity';
import { generateToken } from '../../utils/general/JwtUtils';

interface LoginInput {
  email: string;
  password?: string;
}

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await BackofficeUser.findOne({ where: { email } });

  if (!user) throw { statusCode: 404, message: 'User not found' };

  // 🟢 CASE 1: Invited user without password (first-time activation)
  if (user.is_invited && !user.password) {
    if (!password)
      throw { statusCode: 400, message: 'Password is required to activate your account' };

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.is_invited = false;
    await user.save();

    const token = generateToken({ id: user.id, email: user.email });
    return { user, token };
  }

  // 🟢 CASE 2: Regular login for existing user
  if (!password)
    throw { statusCode: 400, message: 'Password is required' };

  // ✅ Ensure password exists and is a string before comparing
  if (!user.password)
    throw { statusCode: 400, message: 'Password not set for this user' };

  const isMatch = await bcrypt.compare(password, user.password || '');
  if (!isMatch)
    throw { statusCode: 401, message: 'Invalid credentials' };

  const token = generateToken({ id: user.id, email: user.email });
  return { user, token };
};
