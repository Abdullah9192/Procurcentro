import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.bulkInsert('backoffice_permissions', [
      {
        id: uuidv4(),
        module: 'User Management',
        permissions: [
          'Can view dashboard',
          'Can view users procurement activity',
          'Can suspend users',
          'Can export users list',
          'Can view users',
          'Can view users subscription history',
          'Can view users audit log',
          'Can view users basic information',
          'Can view users employees',
          'Can manage users subscription',
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        module: 'Financial Metrics',
        permissions: [
          'Can view dashboard',
          'Can view financial transaction',
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        module: 'Sales',
        permissions: ['Can view dashboard'],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        module: 'Audit Logs',
        permissions: [
          'Can view audit logs',
          'Can export audit logs',
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        module: 'Supports',
        permissions: [
          'Can view support tickets',
          'Can change ticket priority',
          'Can change ticket resolution date',
          'Can assign members to tickets',
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        module: 'Settings',
        permissions: [
          'Can view members',
          'Can add members',
          'Can remove members',
          'Can view members roles',
          'Can add members role',
          'Can edit members role',
          'Can view notification settings',
          'Can add notification settings',
          'Can edit notification settings',
          'Can assign credit value',
          'Can edit credit value',
          'Can delete credit value',
        ],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.bulkDelete('permissions', {}, {});
  },
};
