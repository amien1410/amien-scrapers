const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');


axios('https://www.amazon.com/s?me=A12890QOIOHUD0&marketplaceID=ATVPDKIKX0DER')
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const result = [];
    let best_rank = $("#productDetails_detailBullets_sections1 > tbody > tr:nth-child(5) > td").text().trim();
    let brand_name          = $('#productDetails_detailBullets_sections1 > tbody > tr:nth-child(3) > td').text().trim();
    let product_name        = $('span[data-at=product_name]').text().trim();
    let number_of_reviews   = $('span[data-at=number_of_reviews]').text().trim();
    let loves_count         = $('span[class=css-jk94q9]').text().trim();
    let price               = $('span[class=css-1oz9qb]').text().trim();
    let urls = [];
    $('div.s-main-slot').each((element, index) =>
      urls.push({
        url: $(element).find('h2').find('a.a-link-normal').attr('href')
      })
    );
    console.log(urls);
  })
  .catch(console.error);