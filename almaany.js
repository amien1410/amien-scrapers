// load modules
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())

// declare url
const url = 'https://www.almaany.com/id/dict/ar-id/%D9%81%D8%A7%D8%AD%D8%B4%D8%A9/';

// init puppeteer
// puppeteer usage as normal
puppeteer.launch({ headless: false }).then(async browser => {
  console.log('Running tests..')
  const page = await browser.newPage()
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.isNavigationRequest() && request.redirectChain().length)
      request.abort();
    else
      request.continue();
  });
  await page.goto(url)
  await page.waitForTimeout(5000).then(() => {
		return page.content()
		//Entering Message in the message field
		// const searchResults = await page.waitForSelector("#srch_res");
	});
  console.log(`All done`)
}).then(html => {
    const $ = cheerio.load(html);

    console.log($.html());
  })
  .catch(console.error);