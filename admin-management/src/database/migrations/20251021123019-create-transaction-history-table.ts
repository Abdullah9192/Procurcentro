import { DataTypes, QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('transaction_histories', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      trans_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      billing_cycle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subscription_plan: {
        type: DataTypes.ENUM('starter', 'growth', 'pro', 'enterprise'),
        allowNull: false,
      },
      module: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      number_of_users: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      org_id: {
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

    // Optional indexes for performance
    await queryInterface.addIndex('transaction_histories', ['trans_id'], {
      name: 'transaction_histories_trans_id_index',
    });
    await queryInterface.addIndex('transaction_histories', ['user_id'], {
      name: 'transaction_histories_user_id_index',
    });
    await queryInterface.addIndex('transaction_histories', ['org_id'], {
      name: 'transaction_histories_org_id_index',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeIndex('transaction_histories', 'transaction_histories_trans_id_index');
    await queryInterface.removeIndex('transaction_histories', 'transaction_histories_user_id_index');
    await queryInterface.removeIndex('transaction_histories', 'transaction_histories_org_id_index');
    await queryInterface.dropTable('transaction_histories');
  },
};
