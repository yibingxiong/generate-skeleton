const puppeteer = require('puppeteer');
function sleep (time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    })
}

(async () => {
    const browser = await puppeteer.launch({headless: false
    , devtools: true});
    const page = await browser.newPage();
    page.setViewport({
        width: 375,
        height: 700
    });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('https://mtongzhen.58.com/542624202000#/');
    await sleep(1000)
    // await page.screenshot({path: 'example.png'});
    // const dimensions = await page.evaluate(() => {
    //     return document.getElementById('app');
    // });

    // console.log('Dimensions:', dimensions);
    // await browser.close();
    const nodeElements = await page.$$eval('*', nodeElements => {
        for (let i = 0; i < nodeElements.length; i++) {
            console.log(nodeElements[i].nodeName);
        }
        return nodeElements;
    });
    console.log(nodeElements);
    // for (let i = 0; i < nodeElements.length; i++) {
    //     console.log(nodeElements[i]);
    // }
})();