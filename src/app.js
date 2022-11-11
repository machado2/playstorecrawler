let crawler = require("./Crawler.js")

function crawl() {
    crawler.crawl()
        .then(function () {
            setTimeout(crawl, 500);
        })
        .catch(function (error) {
            console.log(error);
            setTimeout(crawl, 500);
        })
}

crawl();
