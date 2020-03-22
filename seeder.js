let repo = require("./Repository.js")
let crawler = require("./Crawler.js")

crawler.seed().catch(function (error) {
    console.log(error);
});