import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.bulkInsert('supplier_industries', [
            { id: uuidv4(), name: "Agriculture", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Forestry", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Fishing", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Mining", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Oil and Gas", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Utilities (Electricity, Water, Gas)", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Construction", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Architecture", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Real Estate", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Property Management", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Automotive", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Aerospace", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Defense and Military", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Shipbuilding", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Railroads", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Chemicals", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Pharmaceuticals", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Biotechnology", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Food and Beverage", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Tobacco", created_at: new Date(), updated_at: new Date() },
            { id: uuidv4(), name: "Textiles", created_at: new Date(), updated_at: new Date() }
        ]);
    },

    down: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.bulkDelete('supplier_industries', {
            name: [
                "Agriculture",
                "Forestry",
                "Fishing",
                "Mining",
                "Oil and Gas",
                "Utilities (Electricity, Water, Gas)",
                "Construction",
                "Architecture",
                "Real Estate",
                "Property Management",
                "Automotive",
                "Aerospace",
                "Defense and Military",
                "Shipbuilding",
                "Railroads",
                "Chemicals",
                "Pharmaceuticals",
                "Biotechnology",
                "Food and Beverage",
                "Tobacco",
                "Textiles"
            ]
        });
    }
};