
async function testPackage(pclient, packageId) {
    console.log(await pclient.get(packageId));
}

async function test() {
    let PClient = require('./PlaystoreClient.js');
    const pup = require('puppeteer');
    const browser = await pup.launch();
    let pclient = new PClient(browser);
    testPackage(pclient, 'com.chanel.weather.forecast.accu');
    testPackage(pclient, 'com.king.candycrushsaga');
}

test().then(data =>{
    console.log(data);
});