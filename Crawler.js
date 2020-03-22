let repo = require("./Repository.js")
let PlaystoreClient = require("./PlaystoreClient")
let browser = null
let pclient = null

async function getBrowser() {
    if (browser === null) {
        const pup = require('puppeteer');
        browser = await pup.launch();
        return browser
    }
}

async function getClient() {
    if (pclient === null) {
        pclient = new PlaystoreClient(await getBrowser())
    }
    return pclient
}

exports.crawl = async function() {
    let oldest = await repo.getOldest()
    let client = await getClient()
    let id = oldest.packageId
    console.log("updating " + id)
    try {
        data = await client.get(id)
        repo.insertIds(data.linkedApps)
        repo.update(data.app)
    } catch (error) {
        repo.moveToEnd(id)
        throw error
    }
}

exports.seed = async function() {
    const client = await getClient();
    const categories = await client.getCategories();
    console.log("seeding");
    for (let cat of categories) {
        console.log("category " + cat);
        const ids = await client.getIdsCategory(cat);
        console.log("ids ");
        console.log(ids);
        repo.insertIds(ids);
    }
    console.log("ended seeding");
}

exports.close = function() {
    if (browser != null) {
        browser.close();
    }
}