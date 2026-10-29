import { QueryInterface } from 'sequelize';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await queryInterface.bulkInsert('backoffice_users', [
      {
        id: uuidv4(),
        user_id: '0001',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        permissions: JSON.stringify({
          category_1: ['permission1', 'permission2'],
          category_2: ['permission1', 'permission2'],
        }),
        full_name: 'Admin',
        address: 'HQ',
        city: 'LA',
        state: '',
        country: 'USA',
        branch: 'Main',
        department: 'Management',
        is_invited: false,
        phone_number: '03001234567',
        reset_token: null,
        reset_token_expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.bulkDelete('backoffice_users', { email: 'admin@admin.com' }, {});
  },
};
