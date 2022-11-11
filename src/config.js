const fsp = require('fs').promises;

exports.getConfig = async function() {
    return {
        connectionUrl : process.env.CONNECTION,
        dbName: process.env.DBNAME
    }
}