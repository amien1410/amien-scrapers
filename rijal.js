const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const url = 'http://hadithtransmitters.hawramani.com/ibn-abi-hatim-al-razi-al-jarh-wa-l-tadil/'

axios(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    let rijal = [];
    // let index = $('div.letter-nav-container > div.letter-nav-contents').length;
    $('div.letter-nav-container > div.letter-nav-contents > a').each((index, element) => {
        rijal.push({
            id: index,
            url: $(element).attr('href'),
            rawi: $(element).text(),
        });
        console.log(index);
    });
    
    fs.writeFile('./rijal/jarh-wa-tadil.json', JSON.stringify(rijal), (error) => {
        if (error) throw error;
    })
    
    // console.log($('tbody tr:nth-child(2) td:nth-child(3)').text())

    // console.log($('tbody tr').length);
    // console.log(base_url + $('tbody tr:nth-child(2) td:nth-child(4)').find('a').attr('href'));
    // console.log($('tbody tr:nth-child(2) td:nth-child(2)').text());
    // console.log($('tbody tr:nth-child(2) td:nth-child(4) a:nth-child(4)').attr('href'));
    console.log('berhasil');
  })
  .catch(console.error);