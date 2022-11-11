let crawler = require("./Crawler.js")

async function crawl() {
    try {
        await crawler.crawl()
    } catch(e) {
        console.log(e)
    }
}

setInterval(crawl, 5000)
