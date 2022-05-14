const axios = require('axios');
const cheerio = require('cheerio');
var beautify = require("json-beautify");
const base_url = 'https://www.carihadis.com/';
const url = 'https://www.carihadis.com/?teks=%D8%B3%D8%A8%D8%B9%D8%A9+%D9%8A%D8%B8%D9%84%D9%87%D9%85+%D8%A7%D9%84%D9%84%D9%87&perintah=Cari%21';

axios(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const results = [];
    const rows = $('tbody tr').length;
    for (var i = 2; i <= rows; i++) {
      let rows2 = $('tbody tr:nth-child('+i+') td:nth-child(4) a').length;
      let links = [];
      for (var y = 1; y < rows2 + 1; y++) {
        links.push({
          nomor_hadis: $('tbody tr:nth-child('+i+') td:nth-child(4) a:nth-child('+y+')').text(),
          url: base_url + $('tbody tr:nth-child('+i+') td:nth-child(4) a:nth-child('+y+')').attr('href')
        });
      }
      results.push({
        nama_kitab: $('tbody tr:nth-child('+i+') td:nth-child(2)').text(),
        link: links
      });
    }
    console.log(beautify(results, null, 2 , 80));
    // console.log($('tbody tr:nth-child(2) td:nth-child(3)').text())

    // console.log($('tbody tr').length);
    // console.log(base_url + $('tbody tr:nth-child(2) td:nth-child(4)').find('a').attr('href'));
    // console.log($('tbody tr:nth-child(2) td:nth-child(2)').text());
    // console.log($('tbody tr:nth-child(2) td:nth-child(4) a:nth-child(4)').attr('href'));
  })
  .catch(console.error);