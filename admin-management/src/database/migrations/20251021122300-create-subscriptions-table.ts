import { DataTypes, QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('subscriptions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      subscription_plan: {
        type: DataTypes.ENUM('starter', 'growth', 'pro', 'enterprise'),
        allowNull: false,
      },
      plan_type: {
        type: DataTypes.ENUM('plan_based', 'module_based'),
        allowNull: false,
      },
      modules: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      renewal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      next_renewal_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'cancel'),
        defaultValue: 'inactive',
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      billing_cycle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paystack_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    // Optional: add indexes for frequently queried fields
    await queryInterface.addIndex('subscriptions', ['status'], {
      name: 'subscriptions_status_index',
    });
    await queryInterface.addIndex('subscriptions', ['subscription_plan'], {
      name: 'subscriptions_plan_index',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeIndex('subscriptions', 'subscriptions_status_index');
    await queryInterface.removeIndex('subscriptions', 'subscriptions_plan_index');

    // Drop ENUM types before dropping table to prevent leftover enum types in PostgreSQL
    await queryInterface.dropTable('subscriptions');
  },
};
