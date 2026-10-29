'use strict';

import { QueryInterface, Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof import("sequelize")) {
    const organizations: any[] = await queryInterface.sequelize.query(
      `SELECT id FROM organizations`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const payload = organizations.map((org: any) => ({
      id: uuidv4(),
      organization_id: org.id,
      quality: "How satisfied are you with the overall quality of the items delivered?",
      timeliness: "How quickly does the vendor fulfill orders?",
      issue_resolution: "How effective is the vendor in resolving complaints or product issues?",
      adherence: "How accurate are the shipments in terms of product type, quantity, and packaging?",
      communication: "How clear and professional is the vendor's communication?",
      overall: "How would you rate your overall experience working with this vendor?",
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('vendor_evaluations', payload);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete('vendor_evaluations', {}, {});
  },
};
