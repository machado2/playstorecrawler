let repo = require("./Repository.js")
let crawler = require("./Crawler.js")

function crawl() {
    crawler.crawl().catch(function(error) {
        console.log(error);
    });
}

setInterval(crawl, 5000);
