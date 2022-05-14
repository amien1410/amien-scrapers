const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const puppeteer = require('puppeteer-extra');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())


// puppeteer.launch({ headless: false }).then(async browser => {
//   let results = [];
//   console.log('Running tests..')
//   const page = await browser.newPage()
//   await page.setRequestInterception(true);
//   page.on('request', request => {
//     if (request.isNavigationRequest() && request.redirectChain().length)
//       request.abort();
//     else
//       request.continue();
//   });
//   await page.goto('https://medikamio.com/en-gb/diseases/index?page=1');
//   await page.waitForTimeout(5000);
//   const data = await page.evaluate(() => document.querySelector('ul#index-hits-container').outerHTML);
//   let $ = cheerio.load(data);
//   $('li.index-hits-item').each((index, element) => {
//       results.push({
//         disease_name: $(element).find('a').text().trim(),
//         url: $(element).find('a').attr('href')
//       })
//   })
// })

const run = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage()
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.isNavigationRequest() && request.redirectChain().length)
        request.abort();
      else
        request.continue();
    });
    let results = [];
    await page.goto('https://medikamio.com/en-gb/diseases/index?page=1');
    await page.waitForTimeout(5000);
    const data = await page.evaluate(() => document.querySelector('ul').outerHTML);
    let $ = cheerio.load(data);
    $('li.index-hits-item').each((index, element) => {
        results.push({
          disease_name: $(element).find('a').text().trim(),
          url: $(element).find('a').attr('href')
        })
    })
    console.log(results);  
    await browser.close();
    // fs.writeFile('./marc.json', JSON.stringify(result), (error) => {
    //      if (error) throw error;
    // })
};

// run();
// axios.post('https://medikamio.com/en-gb/diseases/index')
//   .then(response => {
//     const html = response.data;
//     const $ = cheerio.load(html);
//     const result = [];
//     // $('div.pname').each((index, element) => {
//     //     console.log($(element).find('a').attr('href'))
//     // })
//     console.log($.html())
//   })
//   .catch(console.error);

// let get_reviews = async () => {
//   let result = [];
//   for (var i = 0; i < 4; i++) {
//     let offset = i * 100;
//         try {
//             let response = await axios('https://api.bazaarvoice.com/data/reviews.json?Filter=contentlocale%3Aen*&Filter=ProductId%3AP468353&Sort=SubmissionTime%3Adesc&Limit=100&Offset='+offset+'&Include=Products%2CComments&Stats=Reviews&passkey=caQ0pQXZTqFVYA1yYnnJ9emgUiW59DXA85Kxry8Ma02HE&apiversion=5.4&Locale=en_US');
//             let html = response.data.Results;
//             const $ = cheerio.load(html);
//             for (let i = 0; i < json.length; i++) {
              
//             }
//             // console.log(result);
//         } catch (error) {
//             console.log("ada kesalahan proses axios");
//         }
//     }
//     // fs.writeFileSync('./reviews.json', JSON.stringify(result), (error) => {
//     //     if (error) throw error;
//     // });
// }

// get_reviews();

axios.get('https://www.google.com/maps/place/Terrazzo/@30.4331626,-97.7795159,17z')
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const result = [];
    // $('div.pname').each((index, element) => {
    //     console.log($(element).find('a').attr('href'))
    // })
    console.log($.html())
  })
  .catch(console.error);