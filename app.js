let repo = require("./Repository.js")
let crawler = require("./Crawler.js")

async function main() {
    await crawler.crawl()
}

// ensure there is at least one id on the database
repo.insertIds(["com.king.candycrushsaga"])

setInterval(function() {
    main().then(function() {

    }, function (error) {
        console.log(error)
    })
}, 10000)
