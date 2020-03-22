// this file isn't used, replaced by google-play-scraper

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
    const filtrado = links.filter(function (str) {
        return str.startsWith("https://play.google.com/store/apps/details?id=");
    });
    const ids = filtrado.map(function (s) {
        return s.match(/id=([^=]*)$/)[1]
    });
    return [...new Set(ids)];
}

async function getName(page) {
    return await page.evaluate(() => {
        return document.getElementsByTagName("h1")[0].textContent;
    });
}

function PlaystoreClient(browser) {
    this.browser = browser;
}

PlaystoreClient.prototype.getPage = async function(url) {
    const page = await this.browser.newPage();
    try {
        await page.setRequestInterception(true);
        page.on('request', request => {
            if (request.resourceType() === 'image')
                request.abort();
            else
                request.continue();
        });
        await page.goto(url);
        return page;
    } catch (e) {
        page.close();
        throw e;
    }
}

PlaystoreClient.prototype.get = async function(packageId) {
    try {
        let url = buildUrl(packageId);
        const page = await this.getPage(url);
        try {
            return {
                app: {
                    packageId: packageId,
                    name: await getName(page),
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
    } catch {
        console.log("fail to parse " + packageId);
        return null;
    }
}

PlaystoreClient.prototype.getCategories = async function () {
    const url = "https://play.google.com/store/apps?hl=en_US";
    const page = await this.getPage(url);
    try {
        const links = await page.evaluate(() => {
            return [...document.getElementsByTagName("a")].map(function (el) { return el.href; });
        });
        const filtrado = links.filter(function (str) {
            return str.startsWith("https://play.google.com/store/apps/category/");
        });
        const ids = filtrado.map(function (s) {
            return s.match(/([^\/]*)$/)[1];
        });
        return [...new Set(ids)];
    } finally {
        page.close();
    }
}

PlaystoreClient.prototype.getIdsCategory = async function (category) {
    const url = "https://play.google.com/store/apps/category/" + category;
    const page = await this.getPage(url);
    try {
        return await getLinkedApps(page);
    } finally {
        page.close();
    }
}

module.exports = PlaystoreClient;