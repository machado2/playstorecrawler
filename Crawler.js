let repo = require("./Repository.js")
let gplay = require('google-play-scraper');

exports.crawl = async function () {
    const oldest = await repo.getOldest()
    const id = oldest.appId
    console.log("updating " + id)
    try {
        const data = await gplay.app({ appId: id });
        const similar = (await gplay.similar({ appId: id }))
            .map(function (a) {
                return a.appId;
            });
        await repo.insertIds(similar);
        await repo.update(data);
    } catch (error) {
        await repo.moveToEnd(id)
        throw error
    }
}

exports.seed = async function () {
    for (let kcat in gplay.category) {
        for (let kcol in gplay.collection) {
            let cat = gplay.category[kcat];
            if (cat.startsWith("GAME")) {
                let col = gplay.collection[kcol];
                try {
                    console.log(cat + " - " + col);
                    list = [...new Set((await gplay.list({ category: cat, collection: col, throttle: 1 }))
                        .map(function (app) {
                            return app.appId;
                        }))];
                    console.log(list);
                    repo.insertIds(list);
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }
    console.log("ended seeding");
}
