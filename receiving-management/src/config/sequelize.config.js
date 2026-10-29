require('ts-node/register');
const path = require('path');
const { NODE_ENV } = require('./EnvVariables');

const env = NODE_ENV ?.trim() || 'development';
// Use absolute path to avoid module resolution issues
const { databaseConfig } = require(path.join(__dirname, '../config/DatabaseSource'));

module.exports = {
  [env]: {
    ...databaseConfig,
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeders'
  },
};