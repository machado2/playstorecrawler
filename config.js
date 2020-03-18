const fsp = require('fs').promises;

exports.getConfig = async function() {
    let conf = await fsp.readFile("./config.json")
    return JSON.parse(conf)
}