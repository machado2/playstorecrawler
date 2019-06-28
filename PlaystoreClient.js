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

function PlaystoreClient(browser) {
    this.browser = browser;
}

PlaystoreClient.prototype.get = async function get(packageId) {
    const browser = await pup.launch();
    let url = buildUrl(packageId);
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.resourceType() === 'image')
            request.abort();
        else
            request.continue();
    });
    await page.goto(url);

    return {
        packageId: packageId,
        description: await getDescription(page),
        containsAds: await getContainsAds(page),
        rating: await getRating(page),
        ratingsCount: await getRatingsCount(page)
    }
}

module.exports = PlaystoreClient;