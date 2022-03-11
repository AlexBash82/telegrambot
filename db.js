const {Sequelize} = require("sequelize");

module.exports = new Sequelize(
    'telega_bot',
    'root',
    'root',
    {
        host: '',
        port: '',
        dialect: 'postgres'
    }
)