import { QueryInterface, DataTypes, Sequelize } from "sequelize";

export default {

  async up(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {

    // Remove old columns (except renewal)
    await queryInterface.removeColumn('subscriptions', 'modules');
    await queryInterface.removeColumn('subscriptions', 'next_renewal_date');
    await queryInterface.removeColumn('subscriptions', 'status');
    await queryInterface.removeColumn('subscriptions', 'billing_cycle');
    await queryInterface.removeColumn('subscriptions', 'paystack_id');

    // Update renewal column
    await queryInterface.changeColumn('subscriptions', 'renewal', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // Change ENUM values
    await queryInterface.changeColumn('subscriptions', 'subscription_plan', {
      type: DataTypes.ENUM('starter', 'enterprise', 'professional'),
      allowNull: false
    });

    await queryInterface.changeColumn('subscriptions', 'plan_type', {
      type: DataTypes.ENUM('yearly', 'monthly'),
      allowNull: false
    });

    // Add new columns
    await queryInterface.addColumn('subscriptions', 'no_of_users', {
      type: DataTypes.INTEGER,
      allowNull: true
    });

    // await queryInterface.addColumn("subscriptions", "organization_id", {
    //   type: DataTypes.UUID,
    //   defaultValue: DataTypes.UUIDV4,
    //   allowNull: false,
    // });

    await queryInterface.addColumn("subscriptions", "organization_id", {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('subscriptions', 'features', {
      type: DataTypes.JSON,
      allowNull: true
    });

  },

  async down(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {

    await queryInterface.removeColumn('subscriptions', 'no_of_users');
    // await queryInterface.removeColumn('subscriptions', 'features');
    await queryInterface.removeColumn("subscriptions", "organization_id");
    await queryInterface.removeColumn("subscriptions", "description");

    await queryInterface.changeColumn('subscriptions', 'renewal', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.changeColumn('subscriptions', 'subscription_plan', {
      type: DataTypes.ENUM('starter', 'growth', 'pro', 'enterprise'),
      allowNull: false
    });

    await queryInterface.changeColumn('subscriptions', 'plan_type', {
      type: DataTypes.ENUM('plan_based', 'module_based'),
      allowNull: false
    });

    await queryInterface.addColumn('subscriptions', 'modules', {
      type: DataTypes.JSON
    });

    await queryInterface.addColumn('subscriptions', 'next_renewal_date', {
      type: DataTypes.DATE
    });

    await queryInterface.addColumn('subscriptions', 'status', {
      type: DataTypes.ENUM('active', 'inactive', 'cancel'),
      defaultValue: 'inactive'
    });

    await queryInterface.addColumn('subscriptions', 'billing_cycle', {
      type: DataTypes.STRING
    });

    await queryInterface.addColumn('subscriptions', 'paystack_id', {
      type: DataTypes.UUID
    });

  }

};