const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const base_url = 'https://al-maktaba.org/';
const url = 'https://al-maktaba.org/book/11430/75';

axios(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const results = [];
    results.push({
        text: $('.nass p:not(.hamesh)').text().replace(/["']/g, ""),
        notes: $('.nass p.hamesh').text().replace(/["']/g, "")
    });
    fs.writeFile('./data/nass.json', JSON.stringify(results), (error) => {
            if (error) throw error;
    })
    console.log("its done");
  })
  .catch(console.error);