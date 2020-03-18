const pup = require('puppeteer');

function buildUrl(packageId) {
    return "https://play.google.com/store/apps/details?id=" + packageId + "&hl=en_US";
}

async function getDescription(page) {
    return await page.evaluate(() => {
        return document.querySelector("meta[property='og:description']").getAttribute('content');
    });
}

async function getContainsAds(page) {
    return await page.evaluate(() => {
        return window.find('Contains Ads', true, false, true);
    });
}

async function getRating(page) {
    // "Rated X.X stars out of five stars"
    let ratingText = await page.evaluate(() => {
        return document.querySelector("div[aria-label^='Rated ']").getAttribute('aria-label');
    });
    return parseFloat(ratingText.match(/Rated ([0-9]\.[0-9])/)[1]);
}

async function getIsFree(page) {
    let isFree = await page.evaluate(() => {
        return document.querySelector("button[aria-label$='Install']") != null
    });
    return isFree
}

async function getContainsIap(page) {
    return await page.evaluate(() => {
        return window.find('Offers in-app purchases', true, false, true);
    });
}

async function getRatingsCount(page) {
    let text = await page.evaluate(() => {
        return document.querySelector("span[aria-label$=' ratings']").textContent;
    });
    text = text.replace(/,/g, "");
    return parseInt(text);
}

async function getLinkedApps(page) {
    let links = await page.evaluate(() => {
        return [...document.getElementsByTagName("a")].map(function (el) { return el.href; });
    });
    return [...new Set(links.filter(function(str) { 
        return str.indexOf("details?id=") >= 0; 
    }).map(function (s) { 
        return s.match(/id=([A-Za-z0-9\.]*)/)[1];
    }))];
}

function PlaystoreClient(browser) {
    this.browser = browser;
}

PlaystoreClient.prototype.get = async function get(packageId) {
    try {
        const browser = await pup.launch();
        let url = buildUrl(packageId);
        const page = await browser.newPage();
        var data = null;
        try {
            await page.setRequestInterception(true);
            page.on('request', request => {
                if (request.resourceType() === 'image')
                    request.abort();
                else
                    request.continue();
            });
            await page.goto(url);

            data = {
                app: {
                    packageId: packageId,
                    description: await getDescription(page),
                    containsAds: await getContainsAds(page),
                    containsIap: await getContainsIap(page),
                    rating: await getRating(page),
                    ratingsCount: await getRatingsCount(page),
                    isFree: await getIsFree(page),
                    lastUpdated: new Date()
                },
                linkedApps: await getLinkedApps(page)
            }
        } finally {
            await page.close();
        }
        return data;
    } catch {
        console.log("fail to parse " + packageId);
        return null;
    }
}

module.exports = PlaystoreClient;